import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      emailVerified: Date | null
    } & DefaultSession["user"]
  }

  interface User {
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    emailVerified: Date | null; // Must match exactly
  }
}