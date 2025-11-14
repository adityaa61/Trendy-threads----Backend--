import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "./user.models";
import { IProduct } from "./product.models";

// Interface for Order Item
export interface IOrderItem {
  productId: IProduct["_id"];
  name: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}

// Interface for Shipping Address
export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Interface for Order
export interface IOrder extends Document {
  user: IUser["_id"];
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  paymentStatus: string;
  status: "Shipped" | "Delivered" | "Cancelled" | "Processing";
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------------
// Order Item Schema
// ----------------------
const orderItemSchema: Schema<IOrderItem> = new Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

// ----------------------
// Order Schema
// ----------------------
const orderSchema: Schema<IOrder> = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
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
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    paymentStatus: { type: String, default: "Pending" },
    status: {
      type: String,
      enum: ["Shipped", "Delivered", "Cancelled", "Processing"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

// Export Order model
const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
