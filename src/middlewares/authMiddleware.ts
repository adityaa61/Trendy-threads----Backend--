import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/user.models";

interface AuthRequest extends Request {
  user?: IUser;
}


const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  console.error("ERROR: SECRET_KEY is not defined in environment variables");
  process.exit(1);
}


export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Not authorized, no token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Not authorized, token missing" });
      return;
    }


    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;


    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }


    req.user = user;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};



export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
