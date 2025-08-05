import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter?: any;
}

// Determine if we should use MongoDB adapter or fallback to JWT-only
const shouldUseMongoDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log("[NextAuth] ⚠️ No MONGODB_URI found, using JWT-only sessions");
    return false;
  }
  
  try {
    // Test MongoDB connection
    const client = await connectMongo;
    console.log("[NextAuth] 🟢 MongoDB connection successful, using database adapter");
    return true;
  } catch (error) {
    console.error("[NextAuth] ❌ MongoDB connection failed, falling back to JWT-only sessions:", error.message);
    return false;
  }
};

export const authOptions: NextAuthOptionsExtended = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        console.log("[NextAuth] 🟢 Google OAuth profile received:", {
          sub: profile.sub,
          email: profile.email,
          name: profile.name,
          given_name: profile.given_name,
          timestamp: new Date().toISOString()
        });
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    // Email provider only available when MongoDB is working
    ...(process.env.RESEND_API_KEY && process.env.MONGODB_URI
      ? [
          EmailProvider({
            server: {
              host: "smtp.resend.com",
              port: 465,
              auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
              },
            },
            from: config.resend.fromNoReply,
          }),
        ]
      : []),
  ],

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
        console.log("[NextAuth] 🟢 Session callback executed:", {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
          strategy: "jwt",
          timestamp: new Date().toISOString()
        });
      }
      return session;
    },
    signIn: async ({ user, account, profile, email, credentials }) => {
      // Log successful sign-ins for debugging
      console.log(`[NextAuth] 🟢 Sign-in callback executed:`, {
        provider: account?.provider,
        email: user?.email,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      return true;
    },
  },
  
  // Always use JWT strategy for reliability - no database dependency for core auth
  session: {
    strategy: "jwt",
  },
  
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};

export default NextAuth(authOptions);