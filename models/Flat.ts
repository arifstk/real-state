// // models/Flat.ts

// import { Schema, models, model, Types } from "mongoose";

// export const FLAT_TYPES = [
//   "1 Bed Apartment",
//   "2 Bed Apartment",
//   "3 Bed Apartment",
//   "Penthouse",
//   "Studio Flat",
// ] as const;

// export interface IFlat {
//   _id: string;
//   vendor: Types.ObjectId;
//   flatType: string;
//   title: string;
//   description: string;
//   price: number;
//   discountPercent?: number;
//   bedrooms: number;
//   bathrooms: number;
//   sizeSqFt: number;
//   floorNo?: string;
//   facing?: string;
//   parking: boolean;
//   city: string;
//   address: string;
//   amenities: string[];
//   images: string[];
//   cloudinaryIds: string[];
//   isAvailable: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const FlatSchema = new Schema<IFlat>(
//   {
//     vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     flatType: {
//       type: String,
//       enum: FLAT_TYPES,
//       required: [true, "Flat type is required"],
//       default: "1 Bed Apartment",
//     },
//     title: { type: String, required: true, trim: true },
//     description: {
//       type: String,
//       required: [true, "Description is required"],
//       trim: true,
//     },
//     price: { type: Number, required: true, min: 0 },
//     discountPercent: { type: Number, default: 0, min: 0, max: 100 },
//     bedrooms: { type: Number, default: 1, min: 0 },
//     bathrooms: { type: Number, default: 1, min: 0 },
//     sizeSqFt: { type: Number, default: 0, min: 0 },
//     floorNo: { type: String, default: "" },
//     facing: { type: String, default: "" },
//     parking: { type: Boolean, default: false },
//     city: { type: String, required: true },
//     address: { type: String, required: true },
//     amenities: { type: [String], default: [] },
//     images: { type: [String], default: [] },
//     cloudinaryIds: { type: [String], default: [], select: false },
//     isAvailable: { type: Boolean, default: true },
//   },
//   { timestamps: true },
// );

// // In dev, drop the cached model so schema changes are picked up after hot reload
// if (process.env.NODE_ENV !== "production" && models.Flat) {
//   delete models.Flat;
// }

// const Flat = models.Flat || model<IFlat>("Flat", FlatSchema);
// export default Flat;

// models/Flat.ts

import { Schema, models, model, Types } from "mongoose";

export const FLAT_TYPES = [
  "1 Bed Apartment",
  "2 Bed Apartment",
  "3 Bed Apartment",
  "Penthouse",
  "Studio Flat",
] as const;

export interface IFlat {
  _id: string;
  vendor: Types.ObjectId;
  flatType: string;
  title: string;
  description: string;
  price: number;
  discountPercent?: number;
  bedrooms: number;
  bathrooms: number;
  sizeSqFt: number;
  floorNo?: string;
  facing?: string;
  parking: boolean;
  city: string;
  address: string;
  amenities: string[];
  images: string[];
  cloudinaryIds: string[];
  isAvailable: boolean;
  isSold?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlatSchema = new Schema<IFlat>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flatType: {
      type: String,
      enum: FLAT_TYPES,
      required: [true, "Flat type is required"],
      default: "1 Bed Apartment",
    },
    title: { type: String, required: true, trim: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    sizeSqFt: { type: Number, default: 0, min: 0 },
    floorNo: { type: String, default: "" },
    facing: { type: String, default: "" },
    parking: { type: Boolean, default: false },
    city: { type: String, required: true },
    address: { type: String, required: true },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    cloudinaryIds: { type: [String], default: [], select: false },
    isAvailable: { type: Boolean, default: true },
    isSold: { type: Boolean, default: false },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production" && models.Flat) {
  delete models.Flat;
}

const Flat = models.Flat || model<IFlat>("Flat", FlatSchema);
export default Flat;
