import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

interface OAuthSignInBtnProps {
   provider: "google" | "github";
}

const OAuthSignInBtn = ({ provider }: OAuthSignInBtnProps) => {
   return (
      <form
         action={async () => {
            "use server"
            await signIn(provider, { redirectTo: "/" })
         }}
         className="w-full"
      >
         <Button className="w-full" type="submit">Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}</Button>
      </form>
   );
};

export default OAuthSignInBtn;