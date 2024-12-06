"use client";

import { useEffect, useRef, useState } from "react";

const SearchUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusedElement = useRef<Element | null>(null);

  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        closeSearch();
      }
    };

    document.addEventListener("keyup", handleKeyUp);
    return () => document.removeEventListener("keyup", handleKeyUp);
  }, [isOpen]);

  const openSearch = () => {
    lastFocusedElement.current = document.activeElement;
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 1200);
  };

  const closeSearch = () => {
    setIsOpen(false);
    inputRef.current?.blur();
    if (lastFocusedElement.current instanceof HTMLElement) {
      lastFocusedElement.current.focus();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-gray-100">
      {/* Search Button */}
      <button
        id="btn-search"
        onClick={openSearch}
        className="fixed top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Open Search
      </button>

      {/* Search Container */}
      <div
        className={`search ${
          isOpen ? "search--open pointer-events-auto" : "pointer-events-none"
        } fixed inset-0 flex flex-col justify-center items-center bg-gray-200 transition-transform`}
      >
        <button
          id="btn-search-close"
          onClick={closeSearch}
          className="btn--search-close absolute top-5 right-5 text-2xl text-gray-700"
        >
          ×
        </button>
        <form className="search__form opacity-0 transition-opacity duration-700 delay-300">
          <input
            ref={inputRef}
            type="search"
            className="search__input text-blue-600 border-b-4 border-blue-600 w-3/4 max-w-lg text-4xl md:text-6xl placeholder-blue-500"
            placeholder="Search here..."
          />
          <span className="search__info text-blue-600 text-sm mt-3 block text-right">
            Start typing to search
          </span>
        </form>
      </div>
    </div>
  );
};

export default SearchUI;
