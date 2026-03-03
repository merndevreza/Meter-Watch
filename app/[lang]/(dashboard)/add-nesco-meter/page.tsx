import React from 'react';
import { getDictionary, hasLocale } from '../../dictionaries/dictionaries';
import { notFound } from 'next/navigation';
import AddNescoMeterForm from './_components/AddNescoMeterForm';
import { Dictionary } from '@/types/dictionary';
import HelpCard from './_components/HelpCard';

export default async function Page({
  params
}: {
  params: Promise<{ lang: "en" | "bn" }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dictionary = await getDictionary(lang);
  return (
    <div className='relative'>
      <div className="w-full max-w-xl mx-auto px-6">
        <AddNescoMeterForm dictionary={dictionary as Dictionary} lang={lang} />
        <HelpCard />
      </div>
    </div>
  );
};
