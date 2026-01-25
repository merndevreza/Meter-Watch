import React from 'react';
import {
   Field,
   FieldSeparator,
} from "@/components/ui/field"
import { ResendSignInBtn } from './ResendSignInBtn';
import OAuthSignInBtn from './OAuthSignInBtn';
const OAuthAndMagicLogin = () => {
   return (
      <>
         <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-6">
            Or continue with
         </FieldSeparator>
         <Field className="mt-8">
            <ResendSignInBtn />
         </Field>
         <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-6">
            Or continue with
         </FieldSeparator>
         <Field className="mt-8">
            <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4">
               <OAuthSignInBtn provider="google" />
               <OAuthSignInBtn provider="github" />
            </div>
         </Field>
      </>
   );
};

export default OAuthAndMagicLogin;