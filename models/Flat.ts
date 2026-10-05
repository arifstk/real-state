// models/Flat.ts
import { Schema, models, model, Types } from "mongoose";

export const FLAT_TYPES = [
  "1 Bed Apartment",
  "2 Bed Apartment",
  "3 Bed Apartment",
  "Penthouse",
  "Studio Flat",
] as const;

export const AMENITIES = [
  "High-Speed Lift",
  "24/7 Security",
  "Backup Generator",
  "Car Parking",
  "Rooftop Garden",
  "Gym & Fitness",
] as const;

export interface IFlat {
  _id: string;
  property: Types.ObjectId;
  flatType: string;
  price: number;
  discountPercent?: number;
  amenities: string[];
  images: string[];
  cloudinaryIds: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FlatSchema = new Schema<IFlat>(
  {
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    flatType: { type: String, required: true, enum: FLAT_TYPES },
    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    cloudinaryIds: { type: [String], default: [], select: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Flat = models.Flat || model<IFlat>("Flat", FlatSchema);
export default Flat;
