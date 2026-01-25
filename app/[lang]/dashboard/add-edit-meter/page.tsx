import React from 'react';
import AddEditMeterForm from './_components/AddEditMeterForm';
import { fetchMeterById } from '@/app/actions/meter';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const mongoId = resolvedSearchParams?.id;
  let result = null;
  if (mongoId) {
    result = await fetchMeterById(mongoId);
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-20">
      <AddEditMeterForm meterData={mongoId ? result?.data : null} mongoId={mongoId} />
    </div>
  );
}