
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from "../dictionaries/dictionaries";
import { auth } from '@/auth'; 
import { fetchUserMeters } from '../../actions/meter';
import MeterCardsWrapper from './_components/MeterCardsWrapper';
import { MeterDataType } from '@/types/meter-type'; 

export default async function Overview({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);
  const session = await auth();
  const meters = await fetchUserMeters(); 
  return (
    <MeterCardsWrapper metersData={(meters.success ? meters.data : []) as MeterDataType[]} />
  )
}

