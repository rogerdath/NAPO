'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Map,
    LayoutDashboard,
    Car,
    FileText,
    Settings,
    Menu
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Områder', href: '/dashboard/areas', icon: Map },
    { name: 'Kjøretøy', href: '/dashboard/vehicles', icon: Car },
    { name: 'Avtaler', href: '/dashboard/agreements', icon: FileText },
    { name: 'Innstillinger', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? 'w-64' : 'w-16'
                    } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}
            >
                <div className="flex h-16 items-center justify-between px-4">
                    {sidebarOpen ? (
                        <h1 className="text-xl font-semibold">NAPO</h1>
                    ) : null}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Menu size={20} />
                    </button>
                </div>
                <nav className="space-y-1 px-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 ${isActive
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-400 dark:text-gray-300'
                                        }`}
                                />
                                {sidebarOpen && item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4">
                    {children}
                </main>
            </div>
        </div>
    );
} 