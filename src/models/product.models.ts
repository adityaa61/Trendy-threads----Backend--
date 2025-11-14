import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "./user.models";

// Interface for product images
interface IProductImage {
  url: string;
  altText?: string;
}

// Interface for product dimensions
interface IProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

// Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  countInStock: number;
  sku: string;
  category: string;
  brand?: string;
  sizes: string[];
  colors: string[];
  collections: string;
  material?: string;
  gender?: "Men" | "Women" | "Unisex" | "Kids";
  images: IProductImage[];
  isFeatured: boolean;
  isPublished: boolean;
  rating: number;
  numReviews: number;
  tags?: string[];
  user: IUser["_id"];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  dimensions?: IProductDimensions;
  weight?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Product schema
const productSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    countInStock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    brand: { type: String },
    sizes: { type: [String], required: true },
    colors: { type: [String], required: true },
    collections: { type: String, required: true },
    material: { type: String },
    gender: { type: String, enum: ["Men", "Women", "Unisex", "Kids" ] },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: { type: [String] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: { type: Number },
  },
  { timestamps: true }
);

// Export Product model
const Product: Model<IProduct> = mongoose.model<IProduct>("Product", productSchema);
export default Product;
