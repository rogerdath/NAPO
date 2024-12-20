"use client";

import "./globals.css";
import { scala, calibri } from './fonts';
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/layout/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/components/theme/language-provider";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import 'leaflet/dist/leaflet.css';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="nb" className={`${scala.variable} ${calibri.variable}`} suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
            </head>
            <body className={cn("min-h-screen font-sans antialiased")}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LanguageProvider>
                        <div className="relative flex min-h-screen bg-background">
                            <Navigation />
                            <main className="flex-1 pl-64">
                                <div className="container p-8">
                                    <div className="absolute right-8 top-4">
                                        <SettingsDialog />
                                    </div>
                                    {children}
                                </div>
                            </main>
                        </div>
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}