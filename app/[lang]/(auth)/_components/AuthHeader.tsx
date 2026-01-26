import LanguageSwitcher from '@/components/LanguageSwitcher';
import SiteLogo from '@/components/SiteLogo';
import { DarkLightToggle } from '@/components/theme-toggle/DarkLightToggle'; 

const AuthHeader = ({ lang }: { lang: "en" | "bn" }) => {
   return (
      <div className="flex w-full items-center gap-1 lg:gap-2 mb-8 bg-muted p-4 rounded-lg">
        <SiteLogo/>
        <div className="ml-auto flex items-center gap-2">
          <DarkLightToggle />
          <LanguageSwitcher lang={lang} />
        </div>
      </div>
   );
};

export default AuthHeader;