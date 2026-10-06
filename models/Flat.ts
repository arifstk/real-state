// // models/Flat.ts
// import { Schema, models, model, Types } from "mongoose";

// export const FLAT_TYPES = [
//   "1 Bed Apartment",
//   "2 Bed Apartment",
//   "3 Bed Apartment",
//   "Penthouse",
//   "Studio Flat",
// ] as const;

// export const AMENITIES = [
//   "High-Speed Lift",
//   "24/7 Security",
//   "Backup Generator",
//   "Car Parking",
//   "Rooftop Garden",
//   "Gym & Fitness",
// ] as const;

// export interface IFlat {
//   _id: string;
//   vendor: Types.ObjectId;
//   flatType: string;
//   title: string;
//   price: number;
//   description: string;
//   discountPercent?: number;
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
//       required: [true, "Flat type is required"],
//       default: "1 Bed Apartment",
//     },
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true, min: 0 },
//     discountPercent: { type: Number, default: 0, min: 0, max: 100 },
//     city: { type: String, required: true },
//     address: { type: String, required: true },
//     amenities: { type: [String], default: [] },
//     images: { type: [String], default: [] },
//     cloudinaryIds: { type: [String], default: [], select: false },
//     isAvailable: { type: Boolean, default: true },
//   },
//   { timestamps: true },
// );

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
  city: string;
  address: string;
  amenities: string[];
  images: string[];
  cloudinaryIds: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlatSchema = new Schema<IFlat>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flatType: {
      type: String,
      required: [true, "Flat type is required"],
      default: "1 Bed Apartment",
    },
    title: { type: String, required: true },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    city: { type: String, required: true },
    address: { type: String, required: true },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    cloudinaryIds: { type: [String], default: [], select: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Flat = models.Flat || model<IFlat>("Flat", FlatSchema);
export default Flat;

