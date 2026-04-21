"use client";

/**
 * CitySearch — city autocomplete input.
 *
 * Fetches /api/cities?q=<query> with a 300ms debounce and shows a dropdown
 * of matching cities. On selection, calls onSelect and updates the Zustand store.
 *
 * Keyboard accessible: arrow keys navigate the dropdown, Enter selects,
 * Escape closes, Tab moves focus away and closes.
 *
 * Design reference: design.md §5 Component Inventory — City Search Bar
 */

import { useState, useRef, useEffect, useCallback, useId } from "react";
import type { City } from "@/lib/types/space";
import { useAppStore } from "@/lib/store";

interface CitySearchProps {
  onSelect?: (city: City) => void;
  placeholder?: string;
}

export function CitySearch({ onSelect, placeholder = "Search for a city…" }: CitySearchProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const activeCity = useAppStore((s) => s.activeCity);
  const setActiveCity = useAppStore((s) => s.setActiveCity);

  const [query, setQuery] = useState(activeCity?.name ?? "");
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>();

  /* Sync display value when active city changes externally (e.g. geolocation) */
  useEffect(() => {
    if (activeCity) setQuery(activeCity.name);
  }, [activeCity]);

  const fetchCities = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cities?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      const cities: City[] = data.cities ?? [];
      setResults(cities);
      setIsOpen(cities.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCities(val), 300);
  }

  function handleSelect(city: City) {
    clearTimeout(blurTimeout.current);
    setActiveCity(city);
    onSelect?.(city);
    setQuery(city.name);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (target) handleSelect(target);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleInputBlur() {
    blurTimeout.current = setTimeout(() => {
      setIsOpen(false);
      if (activeCity) setQuery(activeCity.name);
    }, 150);
  }

  return (
    <div
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-owns={listboxId}
      style={{ position: "relative", width: "100%" }}
    >
      {/* Search icon */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "var(--space-3)",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-tertiary)",
          pointerEvents: "none",
          display: "flex",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11 L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label="Search for a city"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px var(--space-3) 10px 36px",
          backgroundColor: "var(--color-foreground)",
          border: "0.4px solid var(--color-text-disabled)",
          borderRadius: "var(--radius-md)",
          fontSize: 15,
          fontWeight: 300,
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
          outline: "none",
          minHeight: 44,
          transition: "border-color 150ms var(--ease-exit), box-shadow 150ms var(--ease-exit)",
        }}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "var(--color-primary-action)";
          (e.target as HTMLInputElement).style.boxShadow = "0 0 0 2px var(--color-active-state)";
        }}
        onBlurCapture={(e) => {
          (e.target as HTMLInputElement).style.borderColor = "var(--color-text-disabled)";
          (e.target as HTMLInputElement).style.boxShadow = "none";
        }}
      />

      {/* Spinner */}
      {loading && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "var(--space-3)",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-tertiary)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 14" />
          </svg>
        </span>
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="City suggestions"
          style={{
            position: "absolute",
            top: "calc(100% + var(--space-1))",
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: "var(--color-foreground)",
            border: "0.4px solid var(--color-text-disabled)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            listStyle: "none",
            padding: "var(--space-1) 0",
            margin: 0,
            maxHeight: "min(240px, 35vh)",
            overflowY: "auto",
            animation: "fade-in 150ms var(--ease-enter) both",
          }}
        >
          {results.map((city, i) => (
            <li
              key={city.slug}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={activeIndex === i}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(city); }}
              onTouchStart={(e) => { e.preventDefault(); handleSelect(city); }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px var(--space-4)",
                cursor: "pointer",
                backgroundColor:
                  activeIndex === i ? "var(--color-background)" : "transparent",
                transition: "background-color 100ms",
                minHeight: 44,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 300,
                  fontFamily: "var(--font-sans)",
                  color: "var(--color-text-primary)",
                }}
              >
                {city.name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-tertiary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {city.region ? `${city.region}, ` : ""}{city.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
