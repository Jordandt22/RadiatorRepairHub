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
    let value = e.target.value;

    // Only allow letters, spaces, hyphens, and apostrophes for state/city names
    value = value.replace(/[^a-zA-Z\s'-]/g, "");

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
    (!selectedOption || searchTerm !== selectedOption[labelKey]) &&
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
      <label className="block text-sm font-medium text-foreground mb-2">
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
          className={`w-full px-3 py-2 pr-10 border rounded-md bg-card outline-none duration-200 ${
            isInvalid
              ? "border-destructive focus:border-destructive"
              : "border-border focus:border-ring"
          }`}
        />

        {/* Clear Icon */}
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              type="button"
              onClick={handleClearInput}
              className="w-4 h-4 text-muted-foreground hover:text-destructive duration-200 cursor-pointer"
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
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`combobox-${name}-${option[valueKey]}`}
                  ref={(el) => (optionRefs.current[index] = el)}
                  onClick={() => handleOptionSelect(option)}
                  className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                    filters[name] === option[valueKey]
                      ? "bg-tint text-primary"
                      : highlightedIndex === index
                      ? "bg-muted text-foreground"
                      : "text-foreground"
                  }`}
                >
                  {option[labelKey]}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-muted-foreground">
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
