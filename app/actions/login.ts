"use server"

import { signIn } from "@/auth"; 

export const doCredentialsLogin = async (formData: FormData) => {
   try { 
      const result = await signIn("credentials", { 
         email: formData.get("email"),
         password: formData.get("password"),
         redirect: false,
      });
      
      if (result?.error) {
         return { error: result.error };
      }
      
      return { success: true };
   } catch (error) {
      return { error: error instanceof Error ? error.message : "Login failed" };
   }
}