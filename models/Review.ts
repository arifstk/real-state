// models/Review.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  flat: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    flat: { type: Schema.Types.ObjectId, ref: "Flat", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

ReviewSchema.index(
  { user: 1, flat: 1 },
  { unique: true, partialFilterExpression: { flat: { $exists: true } } },
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Review) {
  delete mongoose.models.Review;
}

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);

