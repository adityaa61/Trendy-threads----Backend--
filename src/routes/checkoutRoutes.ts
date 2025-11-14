import express, { Request, Response } from "express";
import Cart from "../models/cart.models";
import Order, { IOrder } from "../models/order.models";
import Checkout, { ICheckout, ICheckoutItem } from "../models/checkout.models";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// ----------------------
// POST /api/checkout
// Create a new checkout session
// Access: Private
// ----------------------
router.post("/", protect, async (req: Request & { user?: any }, res: Response) => {
  const { checkoutItem, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (!checkoutItem || checkoutItem.length === 0) {
    return res.status(400).json({ message: "Checkout is empty" });
  }

  try {
    const newCheckout: ICheckout = await Checkout.create({
      user: req.user._id,
      checkoutItem: checkoutItem as ICheckoutItem[],
      shippingAddress,
      totalPrice,
      paymentMethod,
      paymentStatus: "Pending",
      isPaid: false,
    });

    console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error while creating new checkout", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// PUT /api/checkout/:id/pay
// Update checkout to paid after successful payment
// Access: Private
// ----------------------
router.put("/:id/pay", protect, async (req: Request & { user?: any }, res: Response) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    if (paymentStatus === "Paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = new Date();

      await checkout.save();
      res.status(200).json(checkout);
    } else {
      return res.status(400).json({ message: "Invalid payment status" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ----------------------
// POST /api/checkout/:id/finalize
// Finalize checkout and create order
// Access: Private
// ----------------------
router.post("/:id/finalize", protect, async (req: Request & { user?: any }, res: Response) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    if (checkout.isPaid && !checkout.isFinalized) {
      const finalOrder: IOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItem,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "Paid",
        paymentDetails: checkout.paymentDetails,
      });

      checkout.isFinalized = true;
      checkout.finalizedAt = new Date();
      await checkout.save();

      // Delete user's cart
      await Cart.findOneAndDelete({ user: checkout.user });

      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Payment is not completed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
