export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  // { href: "/hotels", label: "Hotels" },
  // { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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

export const ROOM_CATEGORIES = [
  "Single Bed",
  "Double Bed",
  "Luxury Room",
  "Family Suite",
] as const;

export const AMENITIES = [
  "Free WiFi",
  "Free Breakfast",
  "Room Service",
  "Mountain View",
  "Pool Access",
] as const;

// TypeScript types derived directly constants
export type City = (typeof CITIES)[number];
export type RoomCategory = (typeof ROOM_CATEGORIES)[number];
export type Amenity = (typeof AMENITIES)[number];
