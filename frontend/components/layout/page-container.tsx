"use client";

interface PageContainerProps {
    children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
    return (
        <main className="container mx-auto py-8 px-4 max-w-7xl">
            {children}
        </main>
    );
}