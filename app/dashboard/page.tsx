"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileJson, Users, Building2, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/dashboard-actions";

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
                    setError('No data available');
                }
            } catch (error) {
                console.error('Error loading stats:', error);
                setError('Error loading statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!stats) return <div>No data available</div>;

    return (
        <div className="space-y-8">
            <PageHeader
                title="Dashboard"
                description="Oversikt over kontrakter og ressurser"
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Totalt antall kontrakter
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
                            Totalt antall ressurser
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
                            Gjennomsnittlig km pris
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
                            Antall AvtaleKontor
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
                        <CardTitle>Kontrakttyper</CardTitle>
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
                        <CardTitle>AvtaleKontor Statistikk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(stats.avtaleKontorStats).map(([kontor, stats]) => (
                                <div key={kontor} className="border-b pb-4 last:border-0">
                                    <h3 className="font-medium mb-2">{kontor}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Kontrakter</div>
                                            <div className="text-lg font-medium">{stats.totalContracts}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Transportører</div>
                                            <div className="text-lg font-medium">{stats.transporterCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Byer</div>
                                            <div className="text-lg font-medium">{stats.cityCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Start Kommune</div>
                                            <div className="text-lg font-medium">{stats.startKommuneCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Ressurser</div>
                                            <div className="text-lg font-medium">{stats.totalResources}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Snitt km pris</div>
                                            <div className="text-lg font-medium">{stats.averageCostPerKm.toFixed(2)} kr</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Løyver per AvtaleKontor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Object.entries(stats.licenseStats).map(([kontor, licenseStats]) => (
                                <div key={kontor} className="border-b pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium">{kontor}</h3>
                                        <span className="text-lg font-bold">
                                            Totalt: {licenseStats.totalLicenses} løyver
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(licenseStats.transportorLicenses).map(([transportor, data]) => (
                                            <div key={transportor} className="bg-secondary/5 p-4 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium">{transportor}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {data.total} løyver totalt
                                                    </span>
                                                </div>
                                                {data.areas.length > 0 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                                        {data.areas.map((area) => (
                                                            <div key={area.code} className="flex justify-between items-center text-sm">
                                                                <span className="text-muted-foreground">{area.name}</span>
                                                                <span>{area.count} løyver</span>
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