'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 px-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="text-muted-foreground max-w-md">
          We encountered an error while loading your meters. Try refreshing or contact support if the problem persists.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => reset()} variant="default">
          Try Again
        </Button>
        <Button onClick={() => router.refresh()} variant="outline">
          Refresh Page
        </Button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 w-full max-w-md p-3 bg-muted rounded-lg">
          <summary className="cursor-pointer font-semibold text-sm">
            Error Details
          </summary>
          <pre className="mt-2 text-xs overflow-auto text-muted-foreground">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
