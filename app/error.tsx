'use client' 
import { Button } from "@/components/ui/button";

export default function Error({
   error
}: {
   error: Error & { digest?: string }
}) {
   console.log("error caught", error);

   const handleReload = () => {
      if (typeof window !== 'undefined') {
         window.location.reload()
      }
   }
   return (
      <main
         className="flex flex-col justify-center items-center gap-4 lg:gap-9 py-5 h-screen overflow-x-hidden bg-dark-black text-off-white"
         aria-labelledby="error-occurred"
      >
         <h1 className="font-semibold text-2xl sm:text-4xl lg:text-5xl desktop:text-6xl">
            Something went wrong.
         </h1>
         <p className="font-geist text-lg desktop:text-xl text-center max-w-3/4">
            Please refresh the page or try opening the app in a <span className="whitespace-nowrap">new tab.</span>
         </p>
         <Button onClick={handleReload} variant="secondary" >Reload Page</Button>
      </main>
   )
}