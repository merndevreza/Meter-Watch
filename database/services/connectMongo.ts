import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const cached: {
   connection: typeof mongoose | null;
   promise: ReturnType<typeof mongoose.connect> | null;
} = {
   connection: null,
   promise: null
};

export default async function connectMongo() {
   if (!MONGO_URI) {
      throw new Error("Please define the MONGO_URI environment variable inside .env");
   }
   if (cached.connection) {
      // console.log("✓ Using cached MongoDB connection");
      return cached.connection;
   }
   if (!cached.promise) {
      // console.log("⏳ Creating new MongoDB connection...");
      const opt = {
         bufferCommands: false,
         dbName: "MeterWatch",
      };
      cached.promise = mongoose.connect(MONGO_URI, opt);
   }
   try {
      cached.connection = await cached.promise;
      // console.log("✓ MongoDB connected successfully");
   } catch (error) {
      // console.error("✗ MongoDB connection failed:", error);
      cached.promise = null;
      throw error;
   }
   return cached.connection;
} 
