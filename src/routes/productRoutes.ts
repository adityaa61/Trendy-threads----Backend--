import express, { Request, Response } from "express";
import Product, { IProduct } from "../models/product.models";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();

// ----------------------
// POST /api/products
// Create a new product (private/admin)
// ----------------------
router.post("/", protect, admin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      sku,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      sku,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ----------------------
// PUT /api/products/:id
// Update product (private/admin)
// ----------------------
router.put("/:id", protect, admin, async (req: Request & { user?: any }, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, req.body); // simple way to update fields

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// DELETE /api/products/:id
// Delete product (private/admin)
// ----------------------
router.delete("/:id", protect, admin, async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// GET /api/products
// Get all products (public) with optional queries
// ----------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      brand,
      category,
      minPrice,
      maxPrice,
      search,
      limit,
      sortBy,
      size,
      color,
      collection,
      material,
      gender,
    } = req.query;

    let query: any = {};

    if (collection && collection.toString().toLowerCase() !== "all")
  query.collections = { $regex: new RegExp(`^${collection}$`, "i") };

// ✅ Case-insensitive category filter
if (category && category.toString().toLowerCase() !== "all") {
  query.category = { $regex: new RegExp(`^${category}$`, "i") };
}

if (material)
  query.material = { $in: material.toString().split(",") };

if (size)
  query.sizes = { $in: size.toString().split(",") };

if (brand)
  query.brand = { $in: brand.toString().split(",") };

if (color)
  query.colors = { $in: [color.toString()] };

// ✅ Optional: make gender also case-insensitive
if (gender)
  query.gender = { $regex: new RegExp(`^${gender}$`, "i") };


    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search.toString(), $options: "i" } },
        { description: { $regex: search.toString(), $options: "i" } },
      ];
    }

    // Sort logic
    let sort: any = {};
    switch (sortBy) {
      case "priceAsc":
        sort.price = 1;
        break;
      case "priceDesc":
        sort.price = -1;
        break;
      case "popularity":
        sort.rating = -1;
        break;
    }

    const products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ----------------------
// GET /api/products/best-seller
// Get product with highest rating (public)
// ----------------------
router.get("/best-seller", async (req: Request, res: Response) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    if (!bestSeller) return res.status(404).json({ message: "No best seller found" });
    res.json(bestSeller);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ----------------------
// GET /api/products/new-arrivals
// Get latest 8 products (public)
// ----------------------
router.get("/featured", async (req: Request, res: Response) => {
  try {
    const featuredProducts = await Product.find({
      isFeatured: true,
      isPublished: true, // optional but good practice
    })
      .sort({ createdAt: -1 })
      .limit(8);

    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    res.json(featuredProducts);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// ----------------------
// GET /api/products/similar/:id
// Get similar products based on gender & category
// ----------------------
router.get("/similar/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const similarProducts = await Product.find({
      _id: { $ne: req.params.id },
      gender: product.gender,
      category: product.category,
    }).limit(4);

    res.json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// GET /api/products/:id
// Get single product by ID (public)
// ----------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});



export default router;
