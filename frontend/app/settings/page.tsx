"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function SettingsPage() {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <PageHeader
                title="Innstillinger"
                description="Tilpass applikasjonen etter dine behov"
            />

            <motion.div variants={item}>
                <Card className="border-brand-secondary/20">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Settings className="h-5 w-5 text-brand-secondary" />
                            Applikasjonsinnstillinger
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h3 className="font-medium">Mørk modus</h3>
                                <p className="text-sm text-muted-foreground">
                                    Bytt mellom lys og mørk modus
                                </p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
} 