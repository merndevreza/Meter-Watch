"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { useState } from 'react';

const HelpCard = () => {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div className='absolute top-0 right-0'>
         <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm">
            <Info />
         </Button>
         {isOpen && (
            <Card className="absolute top-10 right-0 w-lg  p-4 z-10">
               <CardTitle>🧪 Sample Consumer Numbers</CardTitle>
               <CardContent>
                  <ul>
                     <li>32016951</li>
                     <li>32016952</li>
                     <li>32016953</li>
                     <li>32016954</li>
                     <li>32016955</li>
                     <li>32016956</li>
                     <li>32016957</li>
                     <li>32016965</li>
                     <li>32016966</li>
                     <li>32016967</li>
                     <li>32016968</li> 
                  </ul>
               </CardContent>
            </Card>
         )}
      </div>
   );
};

export default HelpCard;