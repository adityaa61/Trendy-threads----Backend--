import express, { Request, Response } from "express";
import Order, { IOrder } from "../models/order.models";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// ----------------------
// GET /api/orders/my-orders
// Get logged-in user's orders
// Access: Private
// ----------------------
router.get("/my-orders", protect, async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user._id;
    const orders: IOrder[] = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// GET /api/orders/:id
// Get order details by ID
// Access: Private
// ----------------------
router.get("/:id", protect, async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
