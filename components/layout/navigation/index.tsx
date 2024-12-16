"use client";

import Link from "next/link";
import { FileText, History, Settings, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navigation = [
    {
        href: "/dashboard",
        icon: BarChart,
        label: "Dashboard",
    },
    {
        href: "/transform",
        icon: FileText,
        label: "Import",
    },
    {
        href: "/history",
        icon: History,
        label: "Historikk",
    },
    {
        href: "/settings",
        icon: Settings,
        label: "Innstillinger",
    },
];

export function Navigation() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-brand-primary border-r border-brand-secondary/20">
            <div className="flex h-14 items-center border-b border-brand-secondary/20 px-6">
                <Link className="flex items-center space-x-2" href="/">
                    <span className="font-bold text-xl text-brand-secondary">
                        AvtaleOversikt
                    </span>
                </Link>
            </div>

            <nav className="space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive
                                    ? "bg-brand-secondary/20 text-brand-secondary"
                                    : "text-brand-gray-light hover:text-brand-secondary hover:bg-brand-secondary/10"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-brand-secondary" : "text-brand-gray-light")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
} 