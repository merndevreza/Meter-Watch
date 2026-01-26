import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function Page({ params }: { params: Promise<{ lang: "en" | "bn" }> }) {
   const { lang } = await params;
   return (
      <div className='w-full h-screen flex justify-center items-center'>
         <Card>
         <CardHeader className="text-center">
            <CardTitle className="text-2xl">Verify Email</CardTitle>
         </CardHeader>
         <CardContent className='text-center text-lg'>
            <p >We have send a verification email. Please check your email and verify to continue using this app.</p>
            <p className="pt-8 text-red-400">
               Didn&apos;t receive verification email?
            </p>
            <p className='text-white'>Try <Link className='underline underline-offset-4 ' href={`/${lang}/login`}>Login</Link> again.</p>
         </CardContent>
      </Card>
      </div>
   );
};
