import mongoose, { Schema, models, model, Types } from "mongoose";

export const ROOM_TYPES = [
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

export interface IRoom {
  _id: string;
  hotel: Types.ObjectId;
  roomType: string;
  pricePerNight: number;
  discountPercent?: number;
  amenities: string[];
  images: string[];
  cloudinaryIds: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    roomType: { type: String, required: true, enum: ROOM_TYPES },
    pricePerNight: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    cloudinaryIds: { type: [String], default: [], select: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Room = models.Room || model<IRoom>("Room", RoomSchema);
export default Room;
