'use client';

import { useState, useEffect } from 'react';
import { Contract } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Edit as EditIcon, Save, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { error, info } from '@/app/lib/client-logger';
import { searchContracts } from '@/app/lib/db';

interface ContractManagerProps {
    initialContracts: Contract[];
}

export function ContractManager({ initialContracts }: ContractManagerProps) {
    const [view, setView] = useState<"table" | "json" | "form" | "structure">("table");
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        avtaleKontor: "all",
        type: "all",
        postalCode: ""
    });
    const [contracts, setContracts] = useState<Contract[]>(initialContracts);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>(initialContracts);
    const [stats, setStats] = useState<{
        avtaleKontorer: string[];
        types: string[];
    }>({
        avtaleKontorer: [],
        types: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    // Update stats when contracts change
    useEffect(() => {
        const avtaleKontorer = [...new Set(
            contracts
                .map(c => c.avtaleKontor)
                .filter(Boolean)
        )];

        const types = [...new Set(
            contracts
                .map(c => c.type)
                .filter(Boolean)
        )];

        setStats({ avtaleKontorer, types });
    }, [contracts]);

    // Update filtered contracts when search or filters change
    useEffect(() => {
        const updateFiltered = async () => {
            try {
                setIsLoading(true);
                const filtered = await searchContracts({
                    avtaleKontor: filters.avtaleKontor === "all" ? undefined : filters.avtaleKontor,
                    type: filters.type === "all" ? undefined : filters.type,
                    postalCode: filters.postalCode || undefined
                });

                // Apply search term
                const results = searchTerm
                    ? filtered.filter(contract => 
                        Object.values(contract).some(value => 
                            String(value).toLowerCase().includes(searchTerm.toLowerCase())
                        )
                    )
                    : filtered;

                setFilteredContracts(results);

                await info('ContractManager', 'Filters applied', {
                    filteredCount: results.length,
                    reduction: contracts.length - results.length
                });
            } catch (err) {
                await error('ContractManager', 'Error applying filters', err);
            } finally {
                setIsLoading(false);
            }
        };

        updateFiltered();
    }, [searchTerm, filters, contracts]);

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
                            <TabsTrigger value="structure">Structure</TabsTrigger>
                        </TabsList>

                        <TabsContent value="table" className="m-0">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>AvtaleKontor</TableHead>
                                            <TableHead>AvtaleNavn</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Transport</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContracts.map((contract, index) => (
                                            <TableRow key={contract.id || index}>
                                                <TableCell>{contract.id}</TableCell>
                                                <TableCell>{contract.avtaleKontor}</TableCell>
                                                <TableCell>{contract.avtaleNavn}</TableCell>
                                                <TableCell>{contract.type}</TableCell>
                                                <TableCell>{contract.validTransport}</TableCell>
                                                <TableCell>
                                                    {contract.startLocation ? (
                                                        <>
                                                            {contract.startLocation.city} ({contract.startLocation.postalCode})
                                                        </>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setSelectedContract(contract)}
                                                    >
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

                        {/* Form and Structure views will be added later */}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 