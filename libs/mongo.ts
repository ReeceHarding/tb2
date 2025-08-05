import { MongoClient } from "mongodb";

// This lib is use just to connect to the database in next-auth.
// We don't use it anywhere else in the API routes—we use mongoose.js instead (to be able to use models)
// See /libs/nextauth.js file.

declare global {
  // eslint-disable-next-line no-unused-vars
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const options = {
  // Fix for SSL/TLS compatibility issues with MongoDB Atlas
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Additional connection options for stability
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000,
};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

if (!uri) {
  console.group("⚠️ MONGODB_URI missing from .env");
  console.error(
    "It's not mandatory but a database is required for Magic Links."
  );
  console.error(
    "If you don't need it, remove the code from /libs/next-auth.js (see connectMongo())"
  );
  console.groupEnd();
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((error) => {
      console.error("[MongoDB Client] Connection Error:", error);
      if (error.message?.includes('querySrv ENOTFOUND')) {
        console.error("[MongoDB Client] DNS Resolution Error - This usually means:");
        console.error("- The MongoDB cluster hostname cannot be resolved");
        console.error("- Check if you're connected to the internet");
        console.error("- Verify your MongoDB Atlas cluster is active");
        console.error("- Try using a standard connection string instead of SRV if DNS issues persist");
      }
      throw error;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((error) => {
    console.error("[MongoDB Client] Production Connection Error:", error);
    throw error;
  });
}

export default clientPromise;
