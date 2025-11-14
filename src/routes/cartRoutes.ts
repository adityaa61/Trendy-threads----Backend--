import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Cart, { ICart, ICartProduct } from "../models/cart.models";
import Product from "../models/product.models";

const router = express.Router();

// ----------------------
// Helper Functions
// ----------------------

const calculateTotal = (products: ICartProduct[]) =>
  products.reduce((acc, item) => acc + (item.price ?? 0) * item.quantity, 0);

const GetCart = async (
  userId?: string,
  guestId?: string
): Promise<ICart | null> => {
  if (userId) return await Cart.findOne({ user: userId });
  if (guestId) return await Cart.findOne({ guestId });
  return null;
};

// ----------------------
// POST /api/cart - Add Item to Cart
// ----------------------

router.post("/", async (req: Request, res: Response) => {
  const { productId, quantity, size, color, userId, guestId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await GetCart(userId, guestId);

    // ✅ If no cart exists, create one
    if (!cart) {
      cart = await Cart.create({
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        guestId: userId ? null : guestId || `guest_${Date.now()}`,
        products: [
          {
            productId: product._id,
            name: product.name,
            image: product.images?.[0]?.url ?? "",
            price: product.price ?? 0,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: (product.price ?? 0) * quantity,
      });

      return res.status(201).json(cart);
    }

    // ✅ Cart exists — check if same product already there
    const productIndex = cart.products.findIndex(
      (p: ICartProduct) =>
        (p.productId as mongoose.Types.ObjectId).toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1 && cart.products[productIndex]) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({
        productId: product._id as mongoose.Types.ObjectId,
        name: product.name,
        image: product.images?.[0]?.url ?? "",
        price: product.price ?? 0,
        size,
        color,
        quantity,
      });
    }

    // ✅ Recalculate and save
    cart.totalPrice = calculateTotal(cart.products);
    cart.markModified("products");
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// PUT /api/cart - Update Quantity or Remove Item
// ----------------------

router.put("/", async (req: Request, res: Response) => {
  const { productId, userId, guestId, size, color, quantity } = req.body as {
    productId: string;
    userId?: string;
    guestId?: string;
    size: string;
    color: string;
    quantity: number;
  };

  try {
    const cart = await GetCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p: ICartProduct) =>
        (p.productId as mongoose.Types.ObjectId).toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // ✅ Remove product if quantity <= 0
    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      const existingProduct = cart.products[productIndex];
      if (existingProduct) existingProduct.quantity = quantity;
    }

    cart.totalPrice = calculateTotal(cart.products);
    cart.markModified("products");
    const updatedCart = await cart.save();

    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("PUT /api/cart error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// GET /api/cart - Fetch Cart
// ----------------------

router.get("/", async (req: Request, res: Response) => {
  const { userId, guestId } = req.query as {
    userId?: string;
    guestId?: string;
  };

  try {
    const cart = await GetCart(userId, guestId);
    if (!cart) {
      return res.status(200).json({ products: [], totalPrice: 0 });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// DELETE /api/cart - Remove Specific Item (optional)
// ----------------------

router.delete("/", async (req: Request, res: Response) => {
  const { productId, userId, guestId, size, color } = req.body as {
    productId: string;
    userId?: string;
    guestId?: string;
    size: string;
    color: string;
  };

  try {
    const cart = await GetCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p: ICartProduct) =>
        (p.productId as mongoose.Types.ObjectId).toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex === -1)
      return res.status(404).json({ message: "Item not found" });

    cart.products.splice(productIndex, 1);
    cart.totalPrice = calculateTotal(cart.products);
    cart.markModified("products");
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
