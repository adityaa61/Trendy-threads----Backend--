import express, { Request, Response } from "express";
import Product, { IProduct } from "../models/product.models";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();

// ----------------------
// GET /api/admin/products
// Get all products (Admin only)
// Access: private
// ----------------------
router.get("/", protect, admin, async (req: Request, res: Response) => {
  try {
    const products: IProduct[] = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/:id", protect, admin, async (req: Request, res: Response) => {
  try {
    const { name, description, price, countInStock, sku, sizes, colors, images } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.countInStock = countInStock ?? product.countInStock;
    product.sku = sku ?? product.sku;
    product.sizes = sizes ?? product.sizes;
    product.colors = colors ?? product.colors;

    // 🔥 FIX: Save image array properly
    if (images && Array.isArray(images) && images.length > 0) {
      product.images = images; // [{ url: "cloudinary-url" }]
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});



export default router;
