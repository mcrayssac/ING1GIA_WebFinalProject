"use client";

import { useState, useEffect, useRef } from "react";

export function MultiSelect({ options, selected, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (option) => {
    const isSelected = selected.some(s => s.value === option.value);
    const newSelected = isSelected
      ? selected.filter(s => s.value !== option.value)
      : [...selected, option];
    onChange(newSelected);
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    onChange(selected.filter(s => s.value !== optionValue));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex flex-wrap gap-1 p-2 border rounded-md cursor-pointer min-h-10 items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length > 0 ? (
          selected.map(option => (
            <span 
              key={option.value} 
              className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-1"
            >
              {option.label}
              <button 
                type="button"
                onClick={(e) => removeOption(option.value, e)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={`Remove ${option.label}`}
              >
                
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        )}
        <span className="ml-auto text-gray-400">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length > 0 ? (
            options.map(option => (
              <div
                key={option.value}
                className={`p-2 hover:bg-gray-100 cursor-pointer text-sm ${
                  selected.some(s => s.value === option.value) 
                    ? "bg-blue-50 font-medium" 
                    : ""
                }`}
                onClick={() => {
                  toggleOption(option);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;