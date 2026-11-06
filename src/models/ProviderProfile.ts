import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProviderProfile extends Document {
  user: mongoose.Types.ObjectId;
  professionalTitle: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  serviceCategories: mongoose.Types.ObjectId[];
  serviceAreas: string[];
  city: string;
  area: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  verificationStatus: "pending" | "verified" | "rejected";
  verificationDocuments: string[];
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema = new Schema<IProviderProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    professionalTitle: { type: String, default: "Service Specialist" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 1 },
    serviceCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    serviceAreas: [{ type: String }],
    city: { type: String, default: "Gilgit" },
    area: { type: String, default: "Gilgit City" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [74.3142, 35.9208], // Gilgit coordinates
      },
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationDocuments: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProviderProfileSchema.index({ "location": "2dsphere" });
ProviderProfileSchema.index({ verificationStatus: 1 });
ProviderProfileSchema.index({ city: 1, area: 1 });

const ProviderProfile: Model<IProviderProfile> =
  mongoose.models.ProviderProfile ||
  mongoose.model<IProviderProfile>("ProviderProfile", ProviderProfileSchema);

export default ProviderProfile;

