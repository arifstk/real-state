// models/Property.ts
import { Schema, models, model, Types } from "mongoose";

export interface IProperty {
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

const PropertySchema = new Schema<IProperty>(
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

const Property =
  models.Property || model<IProperty>("Property", PropertySchema);
export default Property;
