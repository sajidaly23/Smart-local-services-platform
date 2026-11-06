import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation extends Document {
  name: string;
  city: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    region: { type: String, default: "Gilgit-Baltistan", trim: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [74.3142, 35.9208],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LocationSchema.index({ city: 1, name: 1 }, { unique: true });
LocationSchema.index({ isActive: 1 });

const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);

export default Location;

