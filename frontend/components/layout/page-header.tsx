"use client";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight text-brand-primary">{title}</h1>
                {description && (
                    <p className="text-lg text-muted-foreground font-scala">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}