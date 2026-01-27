import { auth } from '@/auth';
import { Meters } from '@/database/models/meter-model';
import connectMongo from '@/database/services/connectMongo';
import { replaceMongoIdInArray, replaceMongoIdInObject } from '@/lib/replaceMongoID';

// get all meters of Logged in user
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

// get meter by Id
export async function fetchMeterById(mongoId: string) {
      try {
            const session = await auth();
            if (!session?.user?.id || !session?.user?.emailVerified) {
                  return { success: false, error: "Unauthorized", data: null };
            }
            await connectMongo();
            const meter = await Meters.findOne({ _id: mongoId, meterOwner: session.user.id }).lean();
            if (!meter) {
                  return { success: false, error: "Meter not found", data: null };
            }
            const serializedMeter = JSON.parse(JSON.stringify(meter));
            return {
                  success: true,
                  data: replaceMongoIdInObject(serializedMeter),
            };
      } catch (error) {
            console.error("Error fetching meter by ID:", error);
            return {
                  success: false,
                  error: "Internal Server Error. Please try again later.",
                  data: null
            };
      }
}