import { Zap } from 'lucide-react';
import React from 'react';

const SiteLogo = () => {
   return (
      <div className="flex gap-3">
         <Zap />
         <span className="text-base font-semibold">Meter Watch</span>
      </div>
   );
};

export default SiteLogo;