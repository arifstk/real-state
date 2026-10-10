// app/flats/FlatsFilterClient.tsx

"use client";

import { useState, useMemo } from "react";
import FlatCard from "@/components/cards/FlatCard";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import { CITIES } from "@/lib/constants";

const FLAT_TYPES = [
  "1 Bed Apartment",
  "2 Bed Apartment",
  "3 Bed Apartment",
  "Penthouse",
  "Studio Flat",
];

const BEDROOM_OPTIONS = ["1", "2", "3", "4+"];

const PRICE_STEP = 100_000;

export type FlatListItem = {
  _id: string;
  title: string;
  flatType: string;
  price: number;
  discountPercent?: number;
  bedrooms: number;
  bathrooms: number;
  sizeSqFt: number;
  city: string;
  address: string;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  isSold?: boolean;
  vendorName?: string;
  rating?: number;
  reviewCount?: number;
};

interface FlatsFilterClientProps {
  initialFlats: FlatListItem[];
}

// const formatBDT = (n: number) => `৳${Math.round(n).toLocaleString("en-BD")}`;

const getEffectivePrice = (flat: FlatListItem) =>
  flat.discountPercent
    ? Math.round(flat.price - (flat.price * flat.discountPercent) / 100)
    : flat.price;

const getBedrooms = (flat: FlatListItem): number | null => {
  const match = flat.flatType.match(/^(\d+)\s*Bed/i);
  if (match) return Number(match[1]);
  if (/studio/i.test(flat.flatType)) return 1;
  if (flat.bedrooms > 0) return flat.bedrooms;
  return null; // unknown - only shown under "Any"
};

export default function FlatsFilterClient({ initialFlats }: FlatsFilterClientProps) {
  const priceCeiling = useMemo(() => {
    const max = Math.max(0, ...initialFlats.map(getEffectivePrice));
    return Math.max(PRICE_STEP, Math.ceil(max / PRICE_STEP) * PRICE_STEP);
  }, [initialFlats]);

  // Client filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBeds, setSelectedBeds] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState<number | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const maxPrice = maxPriceInput ?? priceCeiling;

  // Predefined cities + any city that appears in the database
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();

    CITIES.forEach((city) => {
      if (city && city.trim()) citiesSet.add(city.trim());
    });

    initialFlats.forEach((flat) => {
      if (flat.city && flat.city.trim()) citiesSet.add(flat.city.trim());
    });

    return Array.from(citiesSet).sort((a, b) => a.localeCompare(b));
  }, [initialFlats]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedCity("");
    setSelectedBeds("");
    setMaxPriceInput(null);
    setOnlyAvailable(false);
  };

  const filteredFlats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return initialFlats.filter((flat) => {
      const matchesSearch =
        !q ||
        flat.title.toLowerCase().includes(q) ||
        flat.flatType.toLowerCase().includes(q) ||
        flat.city.toLowerCase().includes(q) ||
        flat.address.toLowerCase().includes(q);

      const matchesType = selectedType ? flat.flatType === selectedType : true;

      const matchesCity = selectedCity
        ? flat.city.toLowerCase() === selectedCity.toLowerCase()
        : true;

      const beds = getBedrooms(flat);
      const matchesBeds = !selectedBeds
        ? true
        : beds === null
          ? false
          : selectedBeds === "4+"
            ? beds >= 4
            : beds === Number(selectedBeds);

      const matchesPrice = getEffectivePrice(flat) <= maxPrice;

      const matchesAvailability = onlyAvailable ? flat.isAvailable : true;

      return (
        matchesSearch &&
        matchesType &&
        matchesCity &&
        matchesBeds &&
        matchesPrice &&
        matchesAvailability
      );
    });
  }, [
    initialFlats,
    searchQuery,
    selectedType,
    selectedCity,
    selectedBeds,
    maxPrice,
    onlyAvailable,
  ]);

  const pricePercentage = (maxPrice / priceCeiling) * 100;

  const isFiltered =
    searchQuery ||
    selectedType ||
    selectedCity ||
    selectedBeds ||
    maxPrice < priceCeiling ||
    onlyAvailable;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-2">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">All Flats</h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse apartments, penthouses and studio flats listed by trusted vendors across
              Bangladesh.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs w-fit">
            Showing <span className="font-bold text-slate-800">{filteredFlats.length}</span> of{" "}
            {initialFlats.length} flats
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-start">
          {/* Sidebar filters */}
          <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 sticky top-6 z-1">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Filter size={18} className="text-teal-600" />
                <span>Filters</span>
              </div>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1 transition cursor-pointer font-medium"
                >
                  <RotateCcw size={13} /> Reset All
                </button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Search Keyword</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, area or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* Flat type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Flat Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition"
              >
                <option value="">All Types</option>
                {FLAT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition"
              >
                <option value="">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Bedrooms</label>
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedBeds("")}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedBeds === ""
                    ? "bg-teal-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  Any
                </button>
                {BEDROOM_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedBeds(selectedBeds === opt ? "" : opt)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedBeds === opt
                      ? "bg-teal-600 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Max price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Max Price</span>
                {/* <span className="text-teal-600 font-bold">{formatBDT(maxPrice)}</span> */}
                <span className="text-teal-600 font-bold">${maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={priceCeiling}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #0d9488 ${pricePercentage}%, #e2e8f0 ${pricePercentage}%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 [&::-webkit-slider-runnable-track]:rounded-lg [&::-moz-range-track]:rounded-lg"
              />
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer font-semibold">
                <span>Show Available Only</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </div>
              </label>
            </div>
          </aside>

          {/* Flats grid */}
          <main className="lg:col-span-8 z-2">
            {filteredFlats.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-2xs">
                <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="font-semibold text-base text-slate-700">
                  No flats match your filter criteria.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try relaxing your filters to see more flats.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-teal-50 text-teal-600 font-bold text-xs rounded-xl hover:bg-teal-100 transition cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFlats.map((flat) => (
                  <FlatCard
                    key={flat._id}
                    id={flat._id}
                    propertyName={flat.title}
                    flatType={flat.flatType}
                    city={flat.city}
                    address={flat.address}
                    price={flat.price}
                    discountPercent={flat.discountPercent}
                    images={flat.images}
                    rating={flat.rating}
                    reviewCount={flat.reviewCount}
                    isAvailable={flat.isAvailable}
                    isSold={flat.isSold}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

