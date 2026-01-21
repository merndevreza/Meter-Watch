import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import client from "@/database/services/mongoClient"

export const { handlers, signIn, signOut, auth } = NextAuth({
   adapter: MongoDBAdapter(client),
   providers: [Google, GitHub], 
})