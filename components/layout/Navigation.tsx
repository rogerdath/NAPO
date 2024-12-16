"use client";

import Link from "next/link";
import { FileText, History, Settings, BarChart } from "lucide-react";
import { cn } from "../../lib/utils";
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
        label: "Transform",
    },
    {
        href: "/history",
        icon: History,
        label: "History",
    },
    {
        href: "/settings",
        icon: Settings,
        label: "Settings",
    },
];

export function Navigation() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-indigo-500/20">
            <div className="flex h-14 items-center border-b border-indigo-500/20 px-6">
                <Link className="flex items-center space-x-2" href="/">
                    <span className="font-bold text-xl bg-gradient-to-r from-indigo-500 to-indigo-300 bg-clip-text text-transparent">
                        CSV Transform
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
                                    ? "bg-indigo-500/10 text-indigo-500"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-500" : "text-zinc-400")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
} 