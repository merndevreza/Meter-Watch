
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from "../dictionaries/dictionaries";
import MeterCardsWrapper from './_components/MeterCardsWrapper';
import { NescoMeterDataType } from '@/types/meter-type';
import { Dictionary } from '@/types/dictionary';
import { fetchNescoMeters } from '@/app/actions/getNescoMeters';

export default async function Overview({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);
  const meters = await fetchNescoMeters();

  return (
    <MeterCardsWrapper dictionary={dictionary as Dictionary} metersData={(meters.success ? meters.data : []) as NescoMeterDataType[]} />
  )
}

