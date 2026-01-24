import { auth } from '@/auth';
import { Meters } from '@/database/models/meter-model';
import connectMongo from '@/database/services/connectMongo';
import { replaceMongoIdInArray } from '@/lib/replaceMongoID';

export async function fetchUserMeters() {
      try {
            const session = await auth();
            if (!session?.user?.id || !session?.user?.emailVerified) {
                  return { success: false, error: "Unauthorized", data: [] };
            }

            await connectMongo();
            const meters = await Meters.find({ meterOwner: session.user.id })
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