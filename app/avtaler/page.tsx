"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Edit as EditIcon, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Contract } from "@/types";
import { loadContracts, searchContracts, getContractStats } from "@/app/actions/contract-actions";
import { error, info, debug } from '@/app/lib/logger';

export default function ContractManagerPage() {
    const [view, setView] = useState<"table" | "json" | "form">("table");
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        avtaleKontor: "all",
        type: "all",
        postalCode: ""
    });
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [stats, setStats] = useState<{
        avtaleKontorer: string[];
        types: string[];
    }>({ avtaleKontorer: [], types: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const contractData = await loadContracts();
                const statsData = await getContractStats();

                if (!Array.isArray(contractData)) {
                    throw new Error('Contract data is not an array');
                }

                setContracts(contractData);
                setFilteredContracts(contractData);
                setStats({
                    avtaleKontorer: statsData.avtaleKontorer,
                    types: statsData.types
                });

                await info('ContractManager', 'Initial data loaded', {
                    contractCount: contractData.length,
                    avtaleKontorer: statsData.avtaleKontorer.length,
                    types: statsData.types.length
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error loading contracts';
                setErrorMessage(message);
                await error('ContractManager', 'Failed to load initial data', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const updateFiltered = async () => {
            try {
                await debug('ContractManager', 'Applying filters', {
                    searchTerm,
                    filters,
                    totalContracts: contracts.length
                });

                const filtered = await searchContracts(contracts, searchTerm, {
                    avtaleKontor: filters.avtaleKontor === "all" ? "" : filters.avtaleKontor,
                    type: filters.type === "all" ? "" : filters.type,
                    postalCode: filters.postalCode
                });

                setFilteredContracts(filtered);

                await debug('ContractManager', 'Filters applied', {
                    filteredCount: filtered.length,
                    reduction: contracts.length - filtered.length
                });
            } catch (err) {
                await error('ContractManager', 'Error applying filters', err);
            }
        };
        updateFiltered();
    }, [searchTerm, filters, contracts]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-lg font-medium">Loading contracts...</h2>
                    <p className="text-sm text-muted-foreground">Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-lg font-medium text-red-500">Error Loading Contracts</h2>
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    <Button
                        className="mt-4"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Contract Manager"
                description="Search, edit, and manage contracts"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Search and Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search in all fields..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9"
                                />
                            </div>
                            <Button variant="outline">
                                Advanced Search
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                value={filters.avtaleKontor}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, avtaleKontor: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by AvtaleKontor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All AvtaleKontor</SelectItem>
                                    {stats.avtaleKontorer.map((kontor) => (
                                        <SelectItem key={kontor} value={kontor}>
                                            {kontor}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.type}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {stats.types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Filter by Postal Code"
                                value={filters.postalCode}
                                onChange={(e) => setFilters(prev => ({ ...prev, postalCode: e.target.value }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Contracts ({filteredContracts.length})</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="table">Table View</TabsTrigger>
                            <TabsTrigger value="json">JSON View</TabsTrigger>
                            <TabsTrigger value="form">Form View</TabsTrigger>
                        </TabsList>
                        <TabsContent value="table" className="m-0">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>AvtaleKontor</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Postal Code</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContracts.map((contract, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{contract.AvtaleKontor}</TableCell>
                                                <TableCell>{contract.Type}</TableCell>
                                                <TableCell>{contract.PostalCode}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon">
                                                        <EditIcon className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                        <TabsContent value="json" className="m-0">
                            <pre className="rounded-lg bg-muted p-4 overflow-auto max-h-[600px]">
                                {JSON.stringify(filteredContracts, null, 2)}
                            </pre>
                        </TabsContent>
                        <TabsContent value="form" className="m-0">
                            <div className="text-center text-muted-foreground">
                                Select a contract from the table view to edit in form view
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 