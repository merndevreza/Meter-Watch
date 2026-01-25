import React from 'react';
import AddEditMeterForm from './_components/AddEditMeterForm';
import { fetchMeterById } from '@/app/actions/meter';
import { MeterDataType } from '@/types/meter-type';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { id: mongoId } = await searchParams;
  
  let meterData: MeterDataType | undefined = undefined;

  if (mongoId) {
    const result = await fetchMeterById(mongoId);
    if (result?.success) {
      meterData = result.data as MeterDataType;
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-20">
      <AddEditMeterForm meterData={meterData} mongoId={mongoId} />
    </div>
  );
}