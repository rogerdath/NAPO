'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { serverError } from '@/app/lib/logger';

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error
        serverError(error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
                <div className="text-muted-foreground">
                    <p>An error occurred while processing your request.</p>
                    {error.digest && (
                        <p className="text-sm mt-2">Error Reference: {error.digest}</p>
                    )}
                </div>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => reset()}>Try again</Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Reload page
                    </Button>
                </div>
            </div>
        </div>
    );
} 