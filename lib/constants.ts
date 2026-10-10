// lib/constants.ts

export interface NavLink {
  href: string;
  label: string;
}

// Main navigation (header)
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/flats", label: "Flats" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// "Explore" column in the footer
export const EXPLORE_LINKS: NavLink[] = [
  { href: "/flats", label: "Browse Flats" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/my-bookings", label: "My Bookings" },
];

export const CITIES = [
  "Dhaka",
  "Chattogram",
  "Khulna",
  "Sylhet",
  "Cox's Bazar",
  "Rajshahi",
  "Rangpur",
  "Barisal",
] as const;

export const FLAT_TYPES = [
  "1 Bed Apartment",
  "2 Bed Apartment",
  "3 Bed Apartment",
  "Penthouse",
  "Studio Flat",
] as const;

export const AMENITIES = [
  "Lift / Elevator",
  "Car Parking",
  "Generator Backup",
  "24/7 Security",
  "CCTV",
  "Gas Line",
  "Balcony",
  "Rooftop Access",
  "Gym",
  "Playground",
] as const;

// TypeScript types derived directly from the constants
export type City = (typeof CITIES)[number];
export type FlatType = (typeof FLAT_TYPES)[number];
export type Amenity = (typeof AMENITIES)[number];
