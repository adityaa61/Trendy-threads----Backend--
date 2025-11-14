import mongoose, { Document, Schema } from "mongoose";

export interface ICartProduct {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId | null;
  guestId?: string | null;
  products: ICartProduct[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CartProductSchema = new Schema<ICartProduct>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const CartSchema = new Schema<ICart>(
  {
    // ✅ If user is logged in, link their ObjectId
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // ✅ If guest, assign a unique guestId (like "guest_169877...")
    guestId: { type: String, default: null },

    products: [CartProductSchema],

    // ✅ Always keep track of total
    totalPrice: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);
