import express, { Request, Response } from "express";
import Order from "../models/order.models";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();

// ==============================
// ✅ GET api/admin/orders
// desc: Get all orders (Admin Only)
// access: Private Admin
// ==============================
router.get("/", protect, admin, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // ✅ Newest orders first

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ==============================
// ✅ PUT api/admin/orders/:id
// desc: Update order status
// access: Private Admin
// ==============================
router.put("/:id", protect, admin, async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.status = req.body.status || order.status;

    // If delivered, update delivery info
    if (req.body.status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ==============================
// ✅ DELETE api/admin/orders/:id
// desc: Delete order
// access: Private Admin
// ==============================
router.delete("/:id", protect, admin, async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
