import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; 

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

const LoadingSpinner = ({ 
  size = 24, 
  className, 
  label 
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 
        size={size} 
        className={cn("animate-spin text-muted-foreground", className)} 
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;