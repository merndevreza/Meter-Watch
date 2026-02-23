import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries/dictionaries';
import MeterDetailsWrapper from './_components/MeterDetailsWrapper';
import { getNescoMeterByID } from '@/app/actions/getNescoMeterByID';
import { notFound } from 'next/navigation';

export default async function Page({ params }: {
   params: Promise<{ lang: "en" | "bn", consumerId: string }>
}) {
   const { lang, consumerId } = await params;

   if (!hasLocale(lang)) notFound();
   const dictionary = await getDictionary(lang);
   
   const nescoMeterResponse = await getNescoMeterByID(consumerId);
   if (!nescoMeterResponse.success || !nescoMeterResponse.data) {
      return (
         <div className='flex items-center justify-center h-[60vh]'>
            <p className='text-red-500 text-lg'>{nescoMeterResponse.error || "Failed to fetch meter data"}</p>
         </div>
      );
   }
   return (
      <MeterDetailsWrapper monthlyConsumption={nescoMeterResponse.data?.monthlyConsumption || []} rechargeHistory={nescoMeterResponse.data?.rechargeHistory || []} customer={nescoMeterResponse.data.customer} dictionary ={dictionary} />
   );
};
