import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import config from "@/config";
import { supabase, isSupabaseConfigured } from "./supabase";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter?: any;
}

export const authOptions: NextAuthOptionsExtended = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  // Allow automatic account linking for users with same email across providers
  // This enables users to sign in with Google even if they previously used email auth
  // allowDangerousEmailAccountLinking: true, // Commented out to fix build error
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    // Uses Supabase for user storage instead of MongoDB
    ...(isSupabaseConfigured() && process.env.RESEND_API_KEY
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
  // New users will be saved in Supabase database. Each user has fields like name, email, image, etc.
  // Uses Supabase adapter for reliable database connectivity (replaces MongoDB which had SSL/TLS issues)
  // Learn more about the adapter: https://authjs.dev/reference/adapter/supabase
  // Conditionally use Supabase adapter - fallback to JWT-only if Supabase not configured
  ...(isSupabaseConfigured() ? 
    (() => {
      try {
        console.log("[NextAuth] 🟢 Configuring Supabase adapter for user authentication");
        return { 
          adapter: SupabaseAdapter({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          })
        };
      } catch (error) {
        console.error("[NextAuth] ❌ Supabase adapter setup failed, using JWT-only:", error);
        return {};
      }
    })() 
    : {
      // No database adapter configured, using JWT-only session strategy
      session: { strategy: "jwt" as const }
    }),

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    signIn: async ({ user, account, profile, email, credentials }) => {
      // Log successful sign-ins for debugging
      console.log(`[NextAuth] Sign-in attempt:`, {
        provider: account?.provider,
        email: user?.email,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
      return true;
    },
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};

export default NextAuth(authOptions);
