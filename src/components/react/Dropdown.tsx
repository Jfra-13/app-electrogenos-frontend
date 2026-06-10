import React, { useEffect, useRef, useState } from "react";

export type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
};

const ChevronDown = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Dropdown({
  options,
  value,
  placeholder = "Seleccionar",
  className = "min-h-10 w-44",
  onChange,
}: DropdownProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isVisible]);

  const handleOptionClick = (option: DropdownOption) => {
    onChange?.(option.value);
    setIsVisible(false);
  };

  const selectedLabel = options.find((option) => option.value === value)?.label;
  const displayLabel = value ? selectedLabel || value : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className={`inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-700 outline-none hover:border-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
          !options.length ? "cursor-not-allowed text-gray-400" : ""
        }`}
        aria-expanded={isVisible}
        aria-controls="dropdown-menu"
        disabled={!options.length}
      >
        {displayLabel}
        <span
          className={`transform transition-transform duration-200 ${
            isVisible ? "rotate-180" : ""
          }`}
        >
          <ChevronDown size={20} />
        </span>
      </button>

      {isVisible && options.length > 0 ? (
        <ul
          id="dropdown-menu"
          role="menu"
          className="absolute z-50 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                role="menuitem"
                tabIndex={0}
                aria-selected={value === option.value}
                onClick={() => handleOptionClick(option)}
                className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 focus:bg-orange-100 focus:text-orange-700 focus:outline-none"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        isVisible && (
          <div className="absolute z-50 mt-2 w-full rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-500">
            No options available
          </div>
        )
      )}
    </div>
  );
}
