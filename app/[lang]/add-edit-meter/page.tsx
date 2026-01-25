import React from 'react';
import AddEditMeterForm from './_components/AddEditMeterForm';
import { fetchMeterById } from '@/app/actions/meter';
import { MeterDataType } from '@/types/meter-type';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { getDictionary, hasLocale } from '../dictionaries/dictionaries';

export default async function Page({
  searchParams,
  params
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  params: Promise<{ lang: "en" | "bn" }>;
}) {
  const { id: mongoId } = await searchParams;
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);

  let meterData: MeterDataType | undefined = undefined;
  if (mongoId) {
    const result = await fetchMeterById(mongoId);
    if (result?.success) {
      meterData = result.data as MeterDataType;
    }
  }
  const session = await auth();

  if (!session?.user?.emailVerified) {
    redirect(`/${lang}/login`);
  }
  return (
    <div className="w-full max-w-xl mx-auto mt-20">
      <AddEditMeterForm meterData={meterData} mongoId={mongoId} />
    </div>
  );
}