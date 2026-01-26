import { Zap } from 'lucide-react'; 

const SiteLogo = () => {
   return (
      <div className="flex gap-3">
         <Zap />
         <span className="text-lg font-semibold">Meter Watch</span>
      </div>
   );
};

export default SiteLogo;