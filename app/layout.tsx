import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/layout/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CSV Transform - Data Transformation Tool",
    description: "Transform CSV data to JSON with customizable field selection and formatting",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="nb" suppressHydrationWarning>
            <body className={cn("min-h-screen font-sans antialiased", inter.className)}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="relative flex min-h-screen bg-background">
                        <Navigation />
                        <main className="flex-1 pl-64">
                            <div className="container p-8">
                                <div className="absolute right-8 top-4">
                                    <ThemeToggle />
                                </div>
                                {children}
                            </div>
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}