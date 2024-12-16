"use client";

interface PageHeaderProps {
    title: string;
    description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-brand-primary">{title}</h1>
            {description && (
                <p className="text-lg text-muted-foreground font-scala">
                    {description}
                </p>
            )}
        </div>
    );
}