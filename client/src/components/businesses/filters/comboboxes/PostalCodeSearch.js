"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import useSWR from "swr";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Utils
import { getFetcher } from "@/lib/utils/utils";
import { getLocationApiUrl } from "@/lib/api/location";

function PostalCodeSearch({ stateData }) {
  const { filters, updateFilter } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  const cityId = filters.city_id;
  const stateId = stateData?.id || filters.state_id;

  const postalCodesUrl = cityId
    ? getLocationApiUrl(`/cities/${cityId}/postal-codes`)
    : stateId
    ? getLocationApiUrl(`/states/${stateId}/postal-codes`)
    : null;

  const { data } = useSWR(postalCodesUrl, getFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const postalCodesData = useMemo(() => data?.data || [], [data]);

  const filteredOptions = useMemo(() => {
    if (searchTerm.trim() === "") {
      return postalCodesData;
    }
    return postalCodesData.filter((option) =>
      option.code.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, postalCodesData]);

  useEffect(() => {
    const defaultSelectedOption = postalCodesData.find(
      (option) => option.id === filters.postal_code_id
    );
    if (defaultSelectedOption) {
      setSelectedOption(defaultSelectedOption);
      setSearchTerm(defaultSelectedOption.code.toString());
    } else {
      setSelectedOption(null);
      setSearchTerm("");
      setHighlightedIndex(0);
    }
  }, [filters.postal_code_id, postalCodesData]);

  useEffect(() => {
    if (isOpen && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, "");

    setSearchTerm(value);
    setIsOpen(true);
    setHighlightedIndex(0);

    if (value === "") {
      updateFilter("postal_code_id", "");
    }
  };

  const handleOptionSelect = (option) => {
    const city = option.city;

    if (city) {
      updateFilter("city_id", city.id);
      updateFilter("state_id", city.state_id);
    }

    updateFilter("postal_code_id", option.id);
    setSearchTerm(option.code.toString());
    setIsOpen(false);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    updateFilter("postal_code_id", "");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedOption) {
      setSearchTerm(selectedOption.code.toString());
    }
    setHighlightedIndex(0);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        if (selectedOption && searchTerm !== selectedOption.code.toString()) {
          setSearchTerm(selectedOption.code.toString());
        }
      }
    }, 150);
  };

  const isInvalid =
    searchTerm.trim() !== "" &&
    (!selectedOption || searchTerm !== selectedOption.code.toString()) &&
    !isOpen;

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
          placeholder={
            postalCodesUrl ? "Search postal codes..." : "Select a state first"
          }
          disabled={!postalCodesUrl}
          className={`w-full px-3 py-2 pr-10 border bg-card rounded-md outline-none duration-200 disabled:bg-muted disabled:cursor-not-allowed ${
            isInvalid
              ? "border-destructive focus:border-destructive"
              : "border-border focus:border-ring"
          }`}
        />

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

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`postal-code-${option.id}`}
                  ref={(el) => (optionRefs.current[index] = el)}
                  onClick={() => handleOptionSelect(option)}
                  className={`px-3 py-2 cursor-pointer hover:bg-muted ${
                    filters.postal_code_id === option.id
                      ? "bg-tint text-primary"
                      : highlightedIndex === index
                      ? "bg-muted text-foreground"
                      : "text-foreground"
                  }`}
                >
                  {option.code}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-muted-foreground">
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
