import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IHotel {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  images: string[];
  cloudinaryIds: string[];
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    cloudinaryIds: { type: [String], default: [], select: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

const Hotel = models.Hotel || model<IHotel>("Hotel", HotelSchema);
export default Hotel;
