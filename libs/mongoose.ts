import mongoose from "mongoose";
import User from "@/models/User";

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }
  
  try {
    // Log connection attempt
    console.log("[MongoDB] Attempting to connect to MongoDB...");
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Socket timeout
    });
    
    console.log("[MongoDB] Successfully connected to MongoDB!");
    return conn;
  } catch (error) {
    console.error("[MongoDB] Connection Error:", error);
    
    // Provide more helpful error messages
    if (error.message?.includes('querySrv ENOTFOUND')) {
      console.error("[MongoDB] DNS Resolution Error - Possible causes:");
      console.error("1. Check your internet connection");
      console.error("2. Verify MongoDB Atlas cluster is active");
      console.error("3. Check if your network allows MongoDB connections");
      console.error("4. Try using a different DNS server (e.g., 8.8.8.8)");
      console.error("5. If using a VPN, try disconnecting");
    }
    
    throw error;
  }
};

export default connectMongo;
