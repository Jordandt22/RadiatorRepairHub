"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Data
import POSTAL_CODES from "@/lib/data/postal_codes.json";
import CITIES from "@/lib/data/cities.json";

function PostalCodeSearch({ stateData }) {
  const { filters, updateFilter } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  // Filter postal codes based on selected state or city
  const postalCodesData = useMemo(() => {
    // If a city is selected (from URL or filter), show only postal codes for that city
    if (filters.city_id) {
      return POSTAL_CODES.filter(
        (postal) => postal.city_id === filters.city_id
      );
    }

    // If a state is selected (from URL or filter), show postal codes for all cities in that state
    if (stateData?.id || filters.state_id) {
      const stateId = stateData?.id || filters.state_id;
      // Get all cities in the selected state
      const citiesInState = CITIES.filter((city) => city.state_id === stateId);
      const cityIds = citiesInState.map((city) => city.id);

      // Return postal codes for those cities
      return POSTAL_CODES.filter((postal) => cityIds.includes(postal.city_id));
    }

    // If no state or city is selected, show all postal codes
    return POSTAL_CODES;
  }, [filters.city_id, filters.state_id, stateData]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (searchTerm.trim() === "") {
      return postalCodesData;
    }
    return postalCodesData.filter((option) =>
      option.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, postalCodesData]);

  // Get the selected option from URL
  useEffect(() => {
    const defaultSelectedOption = postalCodesData.find(
      (option) => option.id === filters.postal_code_id
    );
    if (defaultSelectedOption) {
      setSelectedOption(defaultSelectedOption);
      setSearchTerm(defaultSelectedOption.code);
    } else {
      setSelectedOption(null);
      setSearchTerm("");
      setHighlightedIndex(0);
    }
  }, [filters.postal_code_id, postalCodesData]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex, isOpen]);

  // Handle input change
  const handleInputChange = (e) => {
    let value = e.target.value;

    // Only allow numbers for postal codes
    value = value.replace(/[^0-9]/g, "");

    setSearchTerm(value);
    setIsOpen(true);
    setHighlightedIndex(0);

    // If user clears the input, clear the filter
    if (value === "") {
      updateFilter("postal_code_id", "");
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    // Find the city for this postal code
    const city = CITIES.find((c) => c.id === option.city_id);

    // Auto-populate city and state
    if (city) {
      updateFilter("city_id", city.id);
      updateFilter("state_id", city.state_id);
    }

    // Set the postal code
    updateFilter("postal_code_id", option.id);
    setSearchTerm(option.code);
    setIsOpen(false);
  };

  // Handle clear input
  const handleClearInput = () => {
    setSearchTerm("");
    updateFilter("postal_code_id", "");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedOption) {
      setSearchTerm(selectedOption.code);
    }
    setHighlightedIndex(0);
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay closing to allow option click
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        // Reset search term to selected option if no selection was made
        if (selectedOption && searchTerm !== selectedOption.code) {
          setSearchTerm(selectedOption.code);
        } else if (!selectedOption && searchTerm.trim() !== "") {
          // If no valid option selected but has text, keep it to show invalid state
          // This will trigger the red border
        }
      }
    }, 150);
  };

  // Check if input is invalid (has text but no matching valid selection)
  const isInvalid =
    searchTerm.trim() !== "" &&
    (!selectedOption || searchTerm !== selectedOption.code) &&
    !isOpen;

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(0);
        inputRef.current?.blur();
        break;

      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length > 0) {
          // If no option is highlighted, select the first one
          handleOptionSelect(filteredOptions[0]);
        }
        break;

      default:
        break;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Postal Code
      </label>
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search postal codes..."
          className={`w-full px-3 py-2 pr-10 border-2 rounded-md outline-none duration-200 ${
            isInvalid
              ? "border-red-500 focus:border-red-500"
              : "border-gray-200 focus:border-blue-500"
          }`}
        />

        {/* Clear Icon */}
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleClearInput}
              className="w-4 h-4 text-gray-400 hover:scale-125 hover:text-red-400 duration-200 cursor-pointer"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`postal-code-${option.id}`}
                  ref={(el) => (optionRefs.current[index] = el)}
                  onClick={() => handleOptionSelect(option)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    filters.postal_code_id === option.id
                      ? "bg-green-50 text-green-600"
                      : highlightedIndex === index
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-900"
                  }`}
                >
                  {option.code}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">
                No postal codes found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostalCodeSearch;
