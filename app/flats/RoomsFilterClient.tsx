// Rooms Filter Client
"use client";

import { useState, useMemo } from "react";
import RoomCard from "@/components/cards/FlatCard";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import { CITIES, ROOM_CATEGORIES, AMENITIES } from "@/lib/constants";

export type Room = {
  _id: string;
  roomType: string;
  city?: string;
  address?: string;
  pricePerNight: number;
  discountPercent?: number;
  amenities?: string[];
  images: string[];
  isAvailable: boolean;
  hotel?: {
    name: string;
    city?: string;
    address?: string;
  };
  rating?: number;
  reviewCount?: number;
};

interface RoomsFilterClientProps {
  initialRooms: Room[];
}

export default function RoomsFilterClient({ initialRooms }: RoomsFilterClientProps) {
  // Client Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // COMBINE CONSTANTS CITIES WITH DATABASE CITIES
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();

    // Add predefined static cities from constants
    CITIES.forEach((city) => {
      if (city && city.trim()) citiesSet.add(city.trim());
    });

    // Add dynamic cities extracted from initialRooms
    initialRooms.forEach((room) => {
      const city = room.hotel?.city || room.city;
      if (city && city.trim()) {
        citiesSet.add(city.trim());
      }
    });

    return Array.from(citiesSet).sort((a, b) => a.localeCompare(b));
  }, [initialRooms]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedCity("");
    setMaxPrice(1000);
    setOnlyAvailable(false);
    setSelectedAmenities([]);
  };

  const filteredRooms = useMemo(() => {
    return initialRooms.filter((room) => {
      // Instant search logic
      const matchesSearch =
        room.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.hotel?.name && room.hotel.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Room type filter
      const matchesType = selectedType ? room.roomType === selectedType : true;

      // City filter
      const roomCity = room.hotel?.city || room.city || "";
      const matchesCity = selectedCity ? roomCity.toLowerCase() === selectedCity.toLowerCase() : true;

      // Price filter with discount calculation
      const effectivePrice = room.discountPercent
        ? Math.round(room.pricePerNight - (room.pricePerNight * room.discountPercent) / 100)
        : room.pricePerNight;
      const matchesPrice = effectivePrice <= maxPrice;

      // Availability filter
      const matchesAvailability = onlyAvailable ? room.isAvailable : true;

      // Amenities filter
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((a) => room.amenities?.includes(a));

      return matchesSearch && matchesType && matchesCity && matchesPrice && matchesAvailability && matchesAmenities;
    });
  }, [initialRooms, searchQuery, selectedType, selectedCity, maxPrice, onlyAvailable, selectedAmenities]);

  const pricePercentage = ((maxPrice - 20) / (1000 - 20)) * 100;
  const isFiltered =
    searchQuery ||
    selectedType ||
    selectedCity ||
    maxPrice < 1000 ||
    onlyAvailable ||
    selectedAmenities.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-2">

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">All Rooms</h1>
            <p className="text-xs text-slate-500 mt-1">Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.</p>
          </div>
          <div className="text-xs text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs w-fit">
            Showing <span className="font-bold text-slate-800">{filteredRooms.length}</span> of {initialRooms.length} rooms
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-start">

          {/* Sidebar Filter Options (4 cols) */}
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

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Search Keyword</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search room or hotel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Room Category</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition"
              >
                <option value="">All Categories</option>
                {ROOM_CATEGORIES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
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

            {/* Maximum Price Range */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Max Price / Night</span>
                <span className="text-teal-600 font-bold">${maxPrice}</span>
              </div>
              <input
                type="range"
                min={20}
                max={1000}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #0d9488 ${pricePercentage}%, #e2e8f0 ${pricePercentage}%)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 [&::-webkit-slider-runnable-track]:rounded-lg [&::-moz-range-track]:rounded-lg"
              />
            </div>

            {/* Availability Toggle */}
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

            {/* Amenities Checklist (Using AMENITIES constant) */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-600 block">Amenities</label>
              <div className="space-y-1.5">
                {AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition select-none ${isSelected
                          ? "bg-teal-50 border border-teal-200 text-teal-700"
                          : "bg-slate-50 border border-transparent text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      <span>{amenity}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                        className="accent-teal-600 w-4 h-4 rounded"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Rooms Grid View (8 cols) */}
          <main className="lg:col-span-8 z-2">
            {filteredRooms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-2xs">
                <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="font-semibold text-base text-slate-700">No rooms match your filter criteria.</p>
                <p className="text-xs text-slate-400 mt-1">Try relaxing your filters to see more available spaces.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-teal-50 text-teal-600 font-bold text-xs rounded-xl hover:bg-teal-100 transition cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    id={room._id}
                    hotelName={room.hotel?.name || "Luxury Stay"}
                    city={room.hotel?.city || room.city || ""}
                    address={room.hotel?.address || room.address || ""}
                    roomType={room.roomType}
                    pricePerNight={room.pricePerNight}
                    discountPercent={room.discountPercent}
                    images={room.images}
                    rating={room.rating}
                    reviewCount={room.reviewCount}
                    isAvailable={room.isAvailable}
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

