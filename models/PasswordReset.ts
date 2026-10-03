// models/PasswordReset.ts

import mongoose, { Schema, models, model } from "mongoose";

export interface IPasswordReset {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// MongoDB TTL index — auto-deletes the document once expiresAt passes
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.PasswordReset ||
  model<IPasswordReset>("PasswordReset", PasswordResetSchema);
