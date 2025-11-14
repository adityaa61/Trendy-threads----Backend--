import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Make sure MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected`);
  } catch (err: any) {
    console.error("❌ Mongo connection failed:", err.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
