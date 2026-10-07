// import mongoose, { Schema, Document } from "mongoose";

// export interface IBooking extends Document {
//   user: mongoose.Types.ObjectId;
//   room: mongoose.Types.ObjectId;
//   hotel: mongoose.Types.ObjectId;
//   checkIn: Date; 
//   checkOut: Date;
//   totalPrice: number;
//   status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled";
//   paymentType: "online" | "direct";
//   paymentStatus: "paid" | "unpaid" | "pending";
//   stripeSessionId?: string;
// }

// const BookingSchema = new Schema<IBooking>(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
//     hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
//     checkIn: { type: Date, required: true },
//     checkOut: { type: Date, required: true },
//     totalPrice: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "checked_in", "completed", "cancelled"],
//       default: "pending",
//     },
//     paymentType: {
//       type: String,
//       enum: ["online", "direct"],
//       required: true,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["paid", "unpaid", "pending"],
//       default: "unpaid",
//     },
//     stripeSessionId: { type: String },
//   },
//   { timestamps: true },
// );

// export default mongoose.models.Booking ||
//   mongoose.model<IBooking>("Booking", BookingSchema);





// models/Booking.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  flat: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  seller?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  visitDate?: Date;
  message?: string;
  totalPrice: number;
  paymentType: "cash" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  stripeSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    flat: {
      type: Schema.Types.ObjectId,
      ref: "Flat",
      required: [true, "Flat reference is required."],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
    },
    seller: {
      type:Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    visitDate: {
      type: Date,
    },
    message: {
      type: String,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required."],
    },
    paymentType: {
      type: String,
      enum: ["cash", "online"],
      required: [true, "Payment type is required."],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "unpaid", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;

