import mongoose, { Document, Schema, Model, Mixed } from "mongoose";
import { IUser } from "./user.models";
import { IProduct } from "./product.models";

// Interface for a checkout item
export interface ICheckoutItem {
  productId: IProduct["_id"];
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;   
  color?: string; 
}

// Interface for shipping address
export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Interface for Checkout
export interface ICheckout extends Document {
  user: IUser["_id"];
  checkoutItem: ICheckoutItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  paymentStatus: string;
  paymentDetails?: Record<string, any>; // for transaction details etc.
  isFinalized: boolean;
  finalizedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------------
// Checkout Item Schema
// ----------------------
const checkoutItemSchema: Schema<ICheckoutItem> = new Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String, default: "Default" },  
    color: { type: String, default: "Default" },
  },
  { _id: false }
);

// ----------------------
// Checkout Schema
// ----------------------
const checkoutSchema: Schema<ICheckout> = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkoutItem: [checkoutItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentStatus: { type: String, default: "Pending" },
    paymentDetails: { type: Schema.Types.Mixed }, // store payment related details like transaction id
    isFinalized: { type: Boolean, default: false },
    finalizedAt: { type: Date },
  },
  { timestamps: true }
);

// Export Checkout model
const Checkout: Model<ICheckout> = mongoose.model<ICheckout>("Checkout", checkoutSchema);
export default Checkout;
