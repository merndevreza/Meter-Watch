import { Skeleton } from "@/components/ui/skeleton";
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MeterCardSkeleton = () => {
   return (
      <Card className="overflow-hidden pb-0 border-muted-foreground/20">
         {/* CardHeader */}
         <CardHeader className="space-y-2">
            <div className="flex items-start justify-between">
               <div className="space-y-2">
                  {/* Meter Name */}
                  <Skeleton className="h-7 w-36 rounded-md" />
                  {/* Consumer ID / Name */}
                  <Skeleton className="h-4 w-48 rounded-md" />
                  <Skeleton className="h-4 w-40 rounded-md" />
               </div>
               <div className="flex flex-col items-end gap-2">
                  {/* Badge */}
                  <Skeleton className="h-7 w-28 rounded-full" />
                  {/* Bell icon */}
                  <Skeleton className="h-6 w-6 rounded-full" />
               </div>
            </div>
         </CardHeader>

         <CardContent className="space-y-6">
            {/* Balance box */}
            <div className="rounded-xl py-6 px-4 text-center border border-border bg-muted/50 shadow-inner space-y-2">
               <Skeleton className="h-3 w-24 mx-auto rounded-md" />
               <Skeleton className="h-10 w-32 mx-auto rounded-md" />
            </div>

            {/* 2x2 stats grid */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-2">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`space-y-1.5 ${i % 2 !== 0 ? "text-right sm:text-left" : ""}`}>
                     <Skeleton className="h-3 w-16 rounded-md" />
                     <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
               ))}
            </div>

            <Separator className="opacity-60" />

            {/* CardButtons area */}
            <div className="flex gap-2">
               <Skeleton className="h-9 flex-1 rounded-md" />
               <Skeleton className="h-9 flex-1 rounded-md" />
               <Skeleton className="h-9 w-9 rounded-md" />
            </div>
         </CardContent>

         {/* CardFooter */}
         <CardFooter className="bg-muted/40 pb-4 border-t">
            <div className="flex w-full items-center justify-center gap-2">
               <Skeleton className="h-4 w-4 rounded-full" />
               <Skeleton className="h-4 w-36 rounded-md" />
            </div>
         </CardFooter>
      </Card>
   );
};

const DashboardCardsSkeleton = ({ count = 4 }: { count?: number }) => {
   return (
      <div className="grid grid-cols-1 gap-6 xl:gap-8 xl:grid-cols-2 2xl:grid-cols-4">
         {Array.from({ length: count }).map((_, i) => (
            <MeterCardSkeleton key={i} />
         ))}
      </div>
   );
};

export default DashboardCardsSkeleton;