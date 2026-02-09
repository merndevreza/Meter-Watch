"use server";
import { auth } from '@/auth';
import { Customer } from '@/database/models/customer-model';
import connectMongo from '@/database/services/connectMongo';
import { replaceMongoIdInArray } from '@/lib/replaceMongoID';
import { revalidatePath } from 'next/cache';

// get all meters of Logged in user
export async function fetchNescoMeters() {
   try {
      const session = await auth();
      if (!session?.user?.id || !session?.user?.emailVerified) {
         return { success: false, error: "Unauthorized", data: [] };
      }

      await connectMongo();
      const meters = await Customer.find({ userId: session.user.id })
         .sort({ createdAt: -1 })
         .lean();

      const serializedMeters = JSON.parse(JSON.stringify(meters));

      return {
         success: true,
         data: replaceMongoIdInArray(serializedMeters),
      };

   } catch (error) {
      console.error("Error fetching meters:", error);

      return {
         success: false,
         error: "Internal Server Error. Please try again later.",
         data: []
      };
   }
}

// revalidate the dashboard page for all language variants
export async function revalidateDashboard(lang?: string) {
   if (lang) {
      revalidatePath(`/${lang}`, 'layout');
   } else {
      revalidatePath('/', 'layout');
   }
}
