import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettings extends Document {
  email: string;
  phone: string;
  address: string;
  twitterUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  maintenanceMode: boolean;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    email: { type: String, default: "support@luxurystays.com" },
    phone: { type: String, default: "+1 (800) 123-4567" },
    address: { type: String, default: "123 Luxury Way, Suite 500, San Francisco, CA" },
    twitterUrl: { type: String, default: "https://x.com" },
    githubUrl: { type: String, default: "https://github.com" },
    linkedinUrl: { type: String, default: "https://linkedin.com" },
    instagramUrl: { type: String, default: "https://instagram.com" },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);

