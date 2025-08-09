import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
// MongoDB disabled - using Supabase for data storage
// import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
// import connectMongo from "./mongo";
import { supabase, isSupabaseConfigured } from "./supabase";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter?: any;
}

// Determine if we should use MongoDB adapter or fallback to JWT-only
// MongoDB disabled - using JWT sessions and Supabase for data storage
const shouldUseMongoDB = async () => {
  // Always return false to use JWT sessions
  console.log("[NextAuth] ⚠️ MongoDB disabled, using JWT-only sessions with Supabase for data storage");
  return false;
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
    
    // Credentials provider for email/password authentication via Supabase Auth
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isSignUp: { label: "Sign Up", type: "hidden" }
      },
      async authorize(credentials) {
        console.log("[NextAuth] 🟢 Credentials authentication attempt:", {
          email: credentials?.email,
          isSignUp: credentials?.isSignUp,
          timestamp: new Date().toISOString()
        });

        if (!credentials?.email || !credentials?.password) {
          console.error("[NextAuth] ❌ Missing email or password");
          throw new Error("Missing email or password");
        }

        if (!isSupabaseConfigured()) {
          console.error("[NextAuth] ❌ Supabase not configured");
          throw new Error("Authentication service not available");
        }

        try {
          const isSignUp = credentials.isSignUp === 'true';
          
          if (isSignUp) {
            // Sign up new user
            console.log("[NextAuth] 🔵 Attempting sign up with Supabase Auth");
            const { data, error } = await supabase.auth.signUp({
              email: credentials.email,
              password: credentials.password,
            });

            if (error) {
              console.error("[NextAuth] ❌ Supabase sign up error:", error.message);
              throw new Error(error.message.includes('already registered') 
                ? 'An account with this email already exists. Try signing in instead.' 
                : error.message
              );
            }

            if (!data.user) {
              console.error("[NextAuth] ❌ No user returned from Supabase sign up");
              throw new Error("Failed to create account");
            }

            console.log("[NextAuth] 🟢 Supabase sign up successful:", {
              userId: data.user.id,
              email: data.user.email,
              timestamp: new Date().toISOString()
            });

            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.email?.split('@')[0] || 'User',
              image: data.user.user_metadata?.avatar_url || null,
            };
          } else {
            // Sign in existing user
            console.log("[NextAuth] 🔵 Attempting sign in with Supabase Auth");
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });

            if (error) {
              console.error("[NextAuth] ❌ Supabase sign in error:", error.message);
              throw new Error("Invalid email or password");
            }

            if (!data.user) {
              console.error("[NextAuth] ❌ No user returned from Supabase sign in");
              throw new Error("Authentication failed");
            }

            console.log("[NextAuth] 🟢 Supabase sign in successful:", {
              userId: data.user.id,
              email: data.user.email,
              timestamp: new Date().toISOString()
            });

            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.email?.split('@')[0] || 'User',
              image: data.user.user_metadata?.avatar_url || null,
            };
          }
        } catch (error: any) {
          console.error("[NextAuth] ❌ Credentials authentication error:", error);
          throw error;
        }
      }
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