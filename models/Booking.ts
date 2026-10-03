import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  hotel: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled";
  paymentType: "online" | "direct";
  paymentStatus: "paid" | "unpaid" | "pending";
  stripeSessionId?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "completed", "cancelled"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["online", "direct"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "pending"],
      default: "unpaid",
    },
    stripeSessionId: { type: String },
  },
  { timestamps: true },
);

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
