"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileJson, Users, Building2, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/dashboard-actions";
import { useLanguage } from "@/components/theme/language-provider";
import { t } from "@/app/lib/i18n";

interface AvtaleKontorStats {
    totalContracts: number;
    transporterCount: number;
    cityCount: number;
    startKommuneCount: number;
    totalResources: number;
    averageCostPerKm: number;
}

interface LicenseStats {
    totalLicenses: number;
    transportorLicenses: Record<string, {
        total: number;
        areas: {
            code: string;
            name: string;
            count: number;
        }[];
    }>;
}

interface DashboardStats {
    totalContracts: number;
    contractTypes: Record<string, number>;
    totalResources: number;
    averageCostPerKm: number;
    averageMinimumCost: number;
    validTransports: string[];
    validNeeds: string[];
    avtaleKontorStats: Record<string, AvtaleKontorStats>;
    licenseStats: Record<string, LicenseStats>;
}

export default function DashboardPage() {
    const { language } = useLanguage();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                if (data) {
                    setStats(data);
                    setError(null);
                } else {
                    setError(t('errors.loadingFailed', language));
                }
            } catch (error) {
                console.error('Error loading stats:', error);
                setError(t('errors.loadingFailed', language));
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [language]);

    if (loading) return <div>{t('common.loading', language)}</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!stats) return <div>{t('errors.noData', language)}</div>;

    return (
        <div className="space-y-8">
            <PageHeader
                title={t('dashboard.title', language)}
                description={t('dashboard.description', language)}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.totalContracts', language)}
                        </CardTitle>
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalContracts}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.totalResources', language)}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalResources}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.averageCost', language)}
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.averageCostPerKm.toFixed(2)} kr
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('dashboard.avtaleKontor', language)}
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Object.keys(stats.avtaleKontorStats).length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.contractTypes', language)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(stats.contractTypes).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{type}</span>
                                    <span className="text-sm text-muted-foreground">{count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>{t('dashboard.statistics', language)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.avtaleKontorStats).map(([kontor, stats]) => (
                                <div key={kontor} className="border-b pb-4 last:border-0">
                                    <h3 className="font-medium mb-2">{kontor}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">{t('contracts.title', language)}</div>
                                            <div className="text-lg font-medium">{stats.totalContracts}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{t('contracts.transport', language)}</div>
                                            <div className="text-lg font-medium">{stats.transporterCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">{t('contracts.location', language)}</div>
                                            <div className="text-lg font-medium">{stats.cityCount}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('dashboard.licenses', language)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Object.entries(stats.licenseStats).map(([kontor, licenseStats]) => (
                                <div key={kontor} className="border-b pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium">{kontor}</h3>
                                        <span className="text-lg font-bold">
                                            {t('common.total', language)}: {licenseStats.totalLicenses}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(licenseStats.transportorLicenses).map(([transportor, data]) => (
                                            <div key={transportor} className="bg-secondary/5 p-4 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium">{transportor}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {data.total} {t('common.total', language)}
                                                    </span>
                                                </div>
                                                {data.areas.length > 0 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                                        {data.areas.map((area, index) => (
                                                            <div key={`${area.code}-${index}`} className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">{area.name}</span>
                                                                <span>{area.count}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}