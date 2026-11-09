import mongoose, { Schema, Document, Model } from "mongoose";

export interface IService extends Document {
  provider: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceType: "fixed" | "hourly" | "quote";
  images: string[];
  serviceAreas: string[];
  city: string;
  area: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  isActive: boolean;
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason: string | null;
  approvedAt: Date | null;
  reviewedBy: mongoose.Types.ObjectId | null;
  viewsCount: number;
  bookingsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    priceType: { type: String, enum: ["fixed", "hourly", "quote"], default: "fixed" },
    images: [{ type: String }],
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
        default: [74.3142, 35.9208],
      },
    },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    rejectionReason: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    viewsCount: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ServiceSchema.index({ provider: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ "location": "2dsphere" });
ServiceSchema.index({ city: 1, area: 1 });
ServiceSchema.index({ isActive: 1, status: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ title: "text", description: "text" });

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;
