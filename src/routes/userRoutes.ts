import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.models";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

interface AuthRequest extends Request {
  user?: IUser;
}

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error("ERROR: SECRET_KEY is not defined in environment variables");
  process.exit(1);
}

// ----------------------
// POST /api/users/register
// ----------------------
router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "30d" });

    // ✅ Change "id" → "_id" for consistency
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ----------------------
// POST /api/users/login
// ----------------------
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "30d" });

    // ✅ Change "id" → "_id"
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ----------------------
// GET /api/users/profile
// ----------------------
router.get("/profile", protect, async (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

export default router;
