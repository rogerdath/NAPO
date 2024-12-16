"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileJson } from "lucide-react";

export default function AvtalerPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Avtaler"
                description="Oversikt over avtaler og ressurser"
            />

            <Card className="border-brand-secondary/20">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileJson className="h-5 w-5 text-brand-secondary" />
                        Avtaler
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Content will be added later */}
                    <div className="text-muted-foreground text-sm">
                        Under utvikling
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 