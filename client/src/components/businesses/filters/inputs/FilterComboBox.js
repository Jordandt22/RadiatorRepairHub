"use client";

import React, { useState, useRef, useEffect } from "react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

function FilterComboBox({
  options,
  label,
  name,
  valueKey,
  labelKey,
  inputLabel,
  placeholder,
}) {
  const { filters, updateFilter } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  // Get the selected option from URL
  useEffect(() => {
    const defaultSelectedOption = options.find(
      (option) => option[valueKey] === filters[name]
    );
    if (defaultSelectedOption) {
      setSelectedOption(defaultSelectedOption);
      setSearchTerm(defaultSelectedOption[labelKey]);
    } else {
      setSelectedOption(null);
      setSearchTerm("");
      setHighlightedIndex(0);
      setFilteredOptions(options);
    }
  }, [filters, options]);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
    // Set highlighted index to first option when options change
    setHighlightedIndex(0);
  }, [searchTerm, options, labelKey]);

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
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);

    // If user clears the input, clear the filter
    if (value === "") {
      updateFilter(name, "");
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (name === "state_id") {
      // Reset City Filter
      updateFilter("city_id", "");
    } else if (name === "city_id") {
      // Set State Filter
      updateFilter("state_id", option.state_id);
    }

    updateFilter(name, option[valueKey]);
    setSearchTerm(option[labelKey]);
    setIsOpen(false);
  };

  // Handle clear input
  const handleClearInput = () => {
    setSearchTerm("");
    updateFilter(name, "");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedOption) {
      setSearchTerm(selectedOption[labelKey]);
    }
    setHighlightedIndex(0);
  };

  // Handle input blur
  const handleInputBlur = (e) => {
    // Delay closing to allow option click
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        // Reset search term to selected option if no selection was made
        if (selectedOption && searchTerm !== selectedOption[labelKey]) {
          setSearchTerm(selectedOption[labelKey]);
        }
      }
    }, 150);
  };

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
        {label}
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
          placeholder={placeholder || `Search ${inputLabel}...`}
          className="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-md focus:border-blue-500 outline-none duration-200"
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
                  key={`combobox-${name}-${option[valueKey]}`}
                  ref={(el) => (optionRefs.current[index] = el)}
                  onClick={() => handleOptionSelect(option)}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    filters[name] === option[valueKey]
                      ? "bg-green-50 text-green-600"
                      : highlightedIndex === index
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-900"
                  }`}
                >
                  {option[labelKey]}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500">
                No {inputLabel} found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterComboBox;
