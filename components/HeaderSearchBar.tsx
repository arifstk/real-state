// components/HeaderSearchBar.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, BedDouble } from "lucide-react";

export interface SearchResult {
  _id: string;
  title: string;
  subtitle: string;
  type?: string;
  price?: number;
}

export default function HeaderSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API Search logic (200ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    // Navigates directly to the selected room's detail page
    router.push(`/rooms/${item._id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (selectedIndex >= 0 && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else {
      setIsOpen(false);
      // Fallback navigation to the rooms listing page with filter state
      router.push(`/rooms?search=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Highlights matching user text input
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} className="font-extrabold text-teal-700 bg-teal-50 px-0.5 rounded">
              {part}
            </span>
          ) : (
            <span key={index} className="text-slate-700 font-medium">
              {part}
            </span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search rooms, hotels, or cities..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs pl-10 pr-10 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-2xs"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3.5 text-teal-600 animate-spin" />
        )}
      </form>

      {/* Floating Results Dropdown Box */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden z-50 py-2 transition-all">
          {results.length > 0 ? (
            <div>
              <div className="px-3.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Rooms & Stays
              </div>
              {results.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item._id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer text-xs transition-colors ${isSelected ? "bg-teal-50/80 text-teal-900" : "hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                        <BedDouble size={14} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs">{renderHighlightedText(item.title, query)}</div>
                        <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                      </div>
                    </div>

                    {item.price && (
                      <span className="text-xs font-bold text-teal-600 shrink-0 ml-2">
                        ${item.price}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-4 text-xs text-slate-400 text-center font-medium">
              No rooms or hotels found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

