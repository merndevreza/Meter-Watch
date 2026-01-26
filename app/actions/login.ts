"use server";

import { signIn } from "@/auth"; 
import { AuthError } from "next-auth";

export async function doCredentialsLogin(formData: FormData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

  } catch (error) { 
    
    if (error instanceof AuthError) {  
      switch (error.type) {
        case "CallbackRouteError":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}