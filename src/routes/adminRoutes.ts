import express, { Request, Response } from "express";
import User from "../models/user.models";
import { protect, admin } from "../middlewares/authMiddleware";
import { IUser } from "../models/user.models";

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get("/", protect, admin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users: IUser[] = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user (Admin only)
 * @access  Private/Admin
 */
router.post("/", protect, admin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ Validate required fields
    if (!name || !email) {
      res.status(400).json({ message: "Name and email are required" });
      return;
    }

    // ✅ Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // ✅ Set fallback password if none provided
    const finalPassword = password && password.trim() !== "" ? password : "Temp@123";

    // ✅ Normalize role to lowercase (fixes enum issue)
    const normalizedRole = role ? role.toLowerCase() : "customer";

    const newUser = new User({
      name,
      email,
      password: finalPassword,
      role: normalizedRole,
    });

    await newUser.save();

    res.status(201).json({
      message: "✅ User created successfully",
      user: newUser,
    });
  } catch (error: any) {
    console.error("❌ Admin user creation error:", error.message);
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update a user (Admin only)
 * @access  Private/Admin
 */
router.put("/:id", protect, admin, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ Normalize role to lowercase before saving
    const normalizedRole = req.body.role ? req.body.role.toLowerCase() : user.role;

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = normalizedRole;

    const updatedUser = await user.save();
    res.json({
      message: "✅ User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("❌ Admin user update error:", error.message);
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (Admin only)
 * @access  Private/Admin
 */
router.delete("/:id", protect, admin, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await user.deleteOne();
    res.json({ message: "🗑️ User deleted successfully" });
  } catch (error: any) {
    console.error("❌ Admin user delete error:", error.message);
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

export default router;
