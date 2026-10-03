// models/Page.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IPage extends Document {
  slug: string;
  title: string;
  content: string;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Page ||
  mongoose.model<IPage>("Page", PageSchema);
