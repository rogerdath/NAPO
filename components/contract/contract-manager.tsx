'use client';

import { useState, useEffect } from 'react';
import { Contract } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Edit as EditIcon, Save, X, FileJson } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { error, info } from '@/app/lib/client-logger';
import { searchContracts, initDB, storeContracts, getDatabaseInfo, clearDatabase } from '@/app/lib/db';
import { useLanguage } from '@/components/theme/language-provider';
import { t } from '@/app/lib/i18n';
import { scala } from '@/app/fonts';

interface ContractManagerProps {
    initialContracts: Contract[];
}

export function ContractManager({ initialContracts }: ContractManagerProps) {
    const { language } = useLanguage();
    const [isInitializing, setIsInitializing] = useState(true);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        avtaleKontor: "all",
        type: "all",
        postalCode: ""
    });
    const [stats, setStats] = useState<{
        avtaleKontorer: string[];
        types: string[];
    }>({
        avtaleKontorer: [],
        types: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [jsonStructure, setJsonStructure] = useState<any>(null);
    const [showDebug, setShowDebug] = useState(false);
    const [dbInfo, setDbInfo] = useState<any>(null);
    const [view, setView] = useState<'table' | 'json' | 'form' | 'structure'>('table');

    // Initialize IndexedDB and load initial data
    useEffect(() => {
        const initializeDB = async () => {
            try {
                setIsInitializing(true);
                await initDB();
                
                // Load contracts from IndexedDB
                const loadedContracts = await searchContracts({});
                setContracts(loadedContracts);
                setFilteredContracts(loadedContracts);

                // Update stats
                const avtaleKontorer = [...new Set(
                    loadedContracts
                        .map(c => c.avtaleKontor)
                        .filter(Boolean)
                )];

                const types = [...new Set(
                    loadedContracts
                        .map(c => c.type)
                        .filter(Boolean)
                )];

                setStats({ avtaleKontorer, types });

                await info('ContractManager', 'Contracts loaded from IndexedDB', {
                    count: loadedContracts.length
                });
            } catch (err) {
                await error('ContractManager', 'Failed to initialize IndexedDB', err);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeDB();
    }, []);

    // Update filtered contracts when search or filters change
    useEffect(() => {
        const updateFiltered = async () => {
            try {
                setIsLoading(true);
                const searchParams = {
                    avtaleKontor: filters.avtaleKontor === "all" ? undefined : filters.avtaleKontor,
                    type: filters.type === "all" ? undefined : filters.type,
                    postalCode: filters.postalCode || undefined
                };

                const filtered = await searchContracts(searchParams);

                // Apply search term
                const results = searchTerm
                    ? filtered.filter(contract => 
                        Object.values(contract).some(value => 
                            String(value).toLowerCase().includes(searchTerm.toLowerCase())
                        )
                    )
                    : filtered;

                setFilteredContracts(results);

                await info('ContractManager', t('contracts.filtersApplied', language), {
                    filteredCount: results.length,
                    totalCount: contracts.length
                });
            } catch (err) {
                await error('ContractManager', t('errors.filterError', language), err);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isInitializing) {
            updateFiltered();
        }
    }, [searchTerm, filters, contracts, language, isInitializing]);

    const refreshDbInfo = async () => {
        const info = await getDatabaseInfo();
        setDbInfo(info);
    };

    useEffect(() => {
        if (showDebug) {
            refreshDbInfo();
        }
    }, [showDebug]);

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="text-lg font-medium">{t('common.loading', language)}</div>
                    <div className="text-sm text-muted-foreground">
                        {t('contracts.initializing', language)}
                    </div>
                </div>
            </div>
        );
    }

    const renderFormView = () => {
        if (!selectedContract) {
            return (
                <div className="text-center p-8 text-muted-foreground">
                    {t('contracts.selectContractToEdit', language)}
                </div>
            );
        }

        return (
            <div className="space-y-6 p-6">
                <h3 className="text-lg font-medium">{t('contracts.editContract', language)}</h3>
                {/* Add form fields here */}
            </div>
        );
    };

    const renderStructureView = () => {
        if (!jsonStructure) {
            setJsonStructure(contracts[0] || {});
        }

        return (
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{t('contracts.jsonStructure', language)}</h3>
                    <Button onClick={() => {/* Save structure logic */}}>
                        <Save className="h-4 w-4 mr-2" />
                        {t('common.save', language)}
                    </Button>
                </div>
                <div className="bg-secondary/5 p-4 rounded-lg">
                    <pre className="text-sm">
                        {JSON.stringify(jsonStructure, null, 2)}
                    </pre>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title={t('contracts.title', language)}
                description={t('contracts.description', language)}
                action={
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDebug(!showDebug)}
                    >
                        {showDebug ? 'Hide Debug' : 'Show Debug'}
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        {t('contracts.filters', language)}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('contracts.search', language)}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9"
                                />
                            </div>
                            <Button variant="outline">
                                {t('contracts.advancedSearch', language)}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                value={filters.avtaleKontor}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, avtaleKontor: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('contracts.filterByAvtaleKontor', language)} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('common.all', language)}</SelectItem>
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
                                    <SelectValue placeholder={t('contracts.filterByType', language)} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('common.all', language)}</SelectItem>
                                    {stats.types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder={t('contracts.filterByPostalCode', language)}
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
                        <CardTitle>
                            {t('contracts.title', language)} ({filteredContracts.length})
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="table">{t('contracts.tableView', language)}</TabsTrigger>
                            <TabsTrigger value="json">{t('contracts.jsonView', language)}</TabsTrigger>
                            <TabsTrigger value="form">{t('contracts.formView', language)}</TabsTrigger>
                            <TabsTrigger value="structure">{t('contracts.structureView', language)}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="table" className="m-0">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('contracts.id', language)}</TableHead>
                                            <TableHead>{t('contracts.avtaleKontor', language)}</TableHead>
                                            <TableHead>{t('contracts.avtaleName', language)}</TableHead>
                                            <TableHead>{t('contracts.type', language)}</TableHead>
                                            <TableHead>{t('contracts.transport', language)}</TableHead>
                                            <TableHead>{t('contracts.location', language)}</TableHead>
                                            <TableHead>{t('common.actions', language)}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className={scala.className}>
                                        {filteredContracts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-4">
                                                    {t('contracts.noResults', language)}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredContracts.map((contract, index) => (
                                                <TableRow key={contract.id || index}>
                                                    <TableCell>{contract.id}</TableCell>
                                                    <TableCell>{contract.avtaleKontor || '-'}</TableCell>
                                                    <TableCell>{contract.avtaleNavn || '-'}</TableCell>
                                                    <TableCell>{contract.type || '-'}</TableCell>
                                                    <TableCell>{contract.validTransport || '-'}</TableCell>
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
                                                            title={t('common.edit', language)}
                                                        >
                                                            <EditIcon className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
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
                            {renderFormView()}
                        </TabsContent>

                        <TabsContent value="structure" className="m-0">
                            {renderStructureView()}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {showDebug && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Database Debug Info</span>
                            <div className="space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={refreshDbInfo}
                                >
                                    Refresh
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to clear the database?')) {
                                            await clearDatabase();
                                            refreshDbInfo();
                                        }
                                    }}
                                >
                                    Clear DB
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-lg overflow-auto">
                            {JSON.stringify(dbInfo, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 