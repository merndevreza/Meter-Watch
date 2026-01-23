import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import CredentialProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Resend from "next-auth/providers/resend"
import client from "@/database/services/mongoClient"
import connectMongo from "./database/services/connectMongo"
import { Users } from "./database/models/user-model"
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
   adapter: MongoDBAdapter(client),
   session: {
      strategy: "jwt",
   },
   providers: [
      Google,
      GitHub,
      Resend({
         apiKey: process.env.AUTH_RESEND_KEY,
         from: "onboarding@resend.dev", 
      }),
      CredentialProvider({
         credentials: {
            email: { type: "email" },
            password: { type: "password" },
         },
         async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
               throw new Error("Email and password are required");
            }

            await connectMongo();
            try {
               const foundUser = await Users.findOne({
                  email: (credentials.email as string).toLowerCase(),
               }).lean();

               if (!foundUser) {
                  throw new Error("User not found");
               }

               const isMatched = await bcrypt.compare(
                  credentials.password as string,
                  foundUser.password as string
               );
               if (!isMatched) {
                  throw new Error("Email or password is incorrect");
               }

               return foundUser;
            } catch (error) {
               throw new Error(error instanceof Error ? error.message : String(error));
            }
         },
      })
   ],
   callbacks: {
      // Adding emailVerified to session
      async jwt({ token, user }) {
         console.log("token", token);
         console.log("user", user);

         if (user) { 
            token.emailVerified = user.emailVerified;
         }
         return token;
      },
      async session({ session, token }) {
         if (session.user) {
            session.user.id = token.sub as string;
            (session.user as any).emailVerified = token.emailVerified;
         }
         return session;
      },
      async signIn({ user, account, profile }) {
         // If the user is logging in via OAuth (Google/GitHub)
         if (account?.provider !== "credentials" && account?.provider !== "resend") {
            const isEmailVerified = profile?.email_verified || profile?.verified || true;

            if (isEmailVerified && !user.emailVerified) {
               return true;
            }
         }
         return true;
      },
   },
   events: {
      async linkAccount({ user }) {
         // update the user emailVerified as Google verified them
         await connectMongo();
         await Users.findByIdAndUpdate(user.id, { emailVerified: new Date() });
      },
   }
})