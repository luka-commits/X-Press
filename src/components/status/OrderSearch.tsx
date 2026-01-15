"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Search result from /api/orders/search endpoint
 */
export interface OrderSearchResult {
  auftragsnummer: string;
  produkttyp: string | null;
  liefertermin: string | null;
  istStatus: 'in_produktion' | 'fertig' | 'problem' | null;
  kunde: {
    firma: string | null;
    name: string | null;
  } | null;
}

interface OrderSearchProps {
  onSelect: (order: OrderSearchResult) => void;
  className?: string;
}

/**
 * Mobile-optimized order search component with autocomplete dropdown.
 * Debounces input to avoid excessive API calls.
 * Large touch targets (48px+ height) for mobile usability.
 */
export function OrderSearch({ onSelect, className }: OrderSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<OrderSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Clear results if search term is too short
    if (searchTerm.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Debounce API call by 300ms
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/orders/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results);
          setShowDropdown(data.results.length > 0);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const handleSelect = (order: OrderSearchResult) => {
    setShowDropdown(false);
    setSearchTerm(order.auftragsnummer);
    onSelect(order);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-ghl-text-secondary animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-ghl-text-secondary" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Auftragsnummer oder Kunde..."
          className="w-full min-h-12 pl-12 pr-4 bg-white border border-ghl-border rounded-lg text-ghl-text placeholder:text-ghl-text-secondary focus:outline-none focus:ring-2 focus:ring-ghl-blue focus:border-transparent"
        />
      </div>

      {/* Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-ghl-border rounded-lg shadow-lg overflow-hidden">
          {results.map((order) => (
            <button
              key={order.auftragsnummer}
              onClick={() => handleSelect(order)}
              className="w-full min-h-14 px-4 py-3 text-left hover:bg-ghl-bg active:bg-ghl-bg/80 border-b border-ghl-border last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-ghl-text">
                {order.auftragsnummer}
              </div>
              <div className="text-sm text-ghl-text-secondary truncate">
                {order.kunde?.firma || order.kunde?.name || "Unbekannter Kunde"}
                {order.produkttyp && ` - ${order.produkttyp}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
