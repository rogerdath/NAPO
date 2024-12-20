"use client";

import React from "react";
import Link from "next/link";
import { FileText, History, BarChart, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/theme/language-provider";
import { useTheme } from "next-themes";
import { t } from "@/app/lib/i18n";
import { color } from "@/app/styles/theme/utils";

const navigation = [
    {
        href: "/dashboard",
        icon: BarChart,
        labelKey: "navigation.dashboard",
    },
    {
        href: "/transform",
        icon: FileText,
        labelKey: "navigation.transform",
    },
    {
        href: "/avtaler",
        icon: Database,
        labelKey: "navigation.contractManager",
    },
    {
        href: "/history",
        icon: History,
        labelKey: "navigation.history",
    },
];

export function Navigation() {
    const pathname = usePathname();
    const { language } = useLanguage();
    const { theme: currentTheme } = useTheme();
    const mode = currentTheme === 'dark' ? 'dark' : 'light';

    const getNavColor = (path: string) => {
        return color(`nav.${mode}.${path}`);
    };

    return (
        <aside 
            style={{ 
                backgroundColor: getNavColor('background'),
                borderColor: getNavColor('border')
            }}
            className="fixed inset-y-0 left-0 w-64 border-r"
        >
            <div 
                style={{ borderColor: getNavColor('border') }}
                className="flex h-14 items-center border-b px-6"
            >
                <Link className="flex items-center space-x-2" href="/">
                    <span 
                        style={{ 
                            backgroundImage: `linear-gradient(to right, ${getNavColor('text.active')}, ${color(`nav.${mode}.text.active`, 0.6)})` 
                        }}
                        className="font-bold text-xl bg-clip-text text-transparent"
                    >
                        Avtaler
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
                            style={isActive ? {
                                backgroundColor: getNavColor('item.activeBg'),
                                color: getNavColor('text.active')
                            } : {
                                color: getNavColor('text.default')
                            }}
                            className={cn(
                                "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                !isActive && `hover:text-[${getNavColor('text.hover')}] hover:bg-[${getNavColor('item.hoverBg')}]`
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span>{t(item.labelKey, language)}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}