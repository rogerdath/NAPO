'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { error } from '@/app/lib/logger';

export default function ErrorBoundary({
    error: err,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error
        error('ErrorBoundary', 'Application error', err);
    }, [err]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
                <div className="text-muted-foreground">
                    <p>An error occurred while processing your request.</p>
                    {err.digest && (
                        <p className="text-sm mt-2">Error Reference: {err.digest}</p>
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