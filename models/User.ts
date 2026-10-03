import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "superadmin" | "vendor" | "user";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  image?: string;
  provider: "credentials" | "google";
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    password: { type: String, select: false },
    image: { type: String, default: "" },
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    role: { type: String, enum: ["superadmin", "vendor", "user"], default: "user" },
  },
  { timestamps: true }
);

// Hot-reload prevent model duplication
const User = models.User || model<IUser>("User", UserSchema);
export default User;
