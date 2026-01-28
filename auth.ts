import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import CredentialProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Resend from "next-auth/providers/resend"
import client from "@/database/services/mongoClient"
import connectMongo from "./database/services/connectMongo"
import { Users } from "./database/models/user-model"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

interface UserDocument {
   _id: string | ObjectId;
   name?: string;
   email?: string;
   emailVerified?: Date | null;
   image?: string;
   password?: string;
   verificationToken?: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
   adapter: MongoDBAdapter(client),
   session: {
      strategy: "jwt",
   },
   providers: [
      Google({
         allowDangerousEmailAccountLinking: true, // Allow multiple ways of login using same email
      }),
      GitHub({
         allowDangerousEmailAccountLinking: true, // Allow multiple ways of login using same email
      }),
      Resend({
         apiKey: process.env.AUTH_RESEND_KEY,
         from: "meterwatch@webdevreza.xyz",
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

               return {
                  id: foundUser._id.toString(),
                  email: foundUser.email,
                  name: foundUser.name,
                  image: foundUser.image,
                  emailVerified: foundUser.emailVerified,
               };
            } catch (error) {
               throw new Error(error instanceof Error ? error.message : String(error));
            }
         },
      })
   ],
   callbacks: {
      async jwt({ token, user, account }) {
         // On sign in (when user object is present)
         if (user) {
            token.sub = user.id;
            token.emailVerified = user.emailVerified;

            // If it's an OAuth sign in and emailVerified is null, update it
            if (account && account.provider !== "credentials" && account.provider !== "resend" && !user.emailVerified) {
               try {
                  const mongoClient = await client;
                  const db = mongoClient.db();
                  const usersCollection = db.collection<UserDocument>("users");

                  const now = new Date();

                  // Ensure user.id exists and convert to ObjectId
                  if (!user.id) {
                     throw new Error("User ID is missing");
                  }

                  const userId = ObjectId.isValid(user.id)
                     ? new ObjectId(user.id)
                     : user.id;

                  await usersCollection.updateOne(
                     { _id: userId },
                     { $set: { emailVerified: now } }
                  );

                  // Update the token with the new emailVerified value
                  token.emailVerified = now;
               } catch (error) {
                  console.error("Failed to update emailVerified:", error);
               }
            }
         }

         return token;
      },
      async session({ session, token }) {
         if (session.user && token.sub) {
            session.user.id = token.sub;
            session.user.emailVerified = token.emailVerified as Date | null;
         }
         return session;
      },
   },
})