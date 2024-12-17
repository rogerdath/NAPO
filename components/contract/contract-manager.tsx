'use client';

import { useState, useEffect } from 'react';
import { Contract } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Edit as EditIcon, Save, X, FileJson, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { error, info } from '@/app/lib/client-logger';
import { searchContracts, initDB, storeContracts, getDatabaseInfo, clearDatabase, getContractRelatedData } from '@/app/lib/db';
import { useLanguage } from '@/components/theme/language-provider';
import { t } from '@/app/lib/i18n';
import { scala } from '@/app/fonts';

interface ContractManagerProps {
    initialContracts: Contract[];
}

interface EditableContract extends Contract {
    isEditing?: boolean;
    isExpanded?: boolean;
    editedValues?: Partial<Contract>;
    relatedData?: {
        area?: any;
        contractType?: any;
        resources?: any[];
        location?: any;
        contractContent?: any;
        isLoading?: boolean;
    };
}

export function ContractManager({ initialContracts }: ContractManagerProps) {
    const { language } = useLanguage();
    const [isInitializing, setIsInitializing] = useState(true);
    const [contracts, setContracts] = useState<EditableContract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<EditableContract[]>([]);
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
                
                if (loadedContracts.length === 0) {
                    await info('ContractManager', 'No contracts found in database');
                    setContracts([]);
                    setFilteredContracts([]);
                    setStats({ avtaleKontorer: [], types: [] });
                    return;
                }

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
                setContracts([]);
                setFilteredContracts([]);
                setStats({ avtaleKontorer: [], types: [] });
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

    // Function to toggle row expansion
    const toggleRowExpansion = async (contractId: string) => {
        const contract = filteredContracts.find(c => c.id === contractId);
        if (!contract) return;

        // If already expanded, just collapse
        if (contract.isExpanded) {
            setFilteredContracts(prev => prev.map(c => 
                c.id === contractId ? { ...c, isExpanded: false } : c
            ));
            return;
        }

        // Set loading state
        setFilteredContracts(prev => prev.map(c => 
            c.id === contractId ? {
                ...c,
                isExpanded: true,
                relatedData: { isLoading: true }
            } : c
        ));

        try {
            // Fetch related data
            const relatedData = await getContractRelatedData(contract.omradeKode);
            
            // Update contract with related data
            setFilteredContracts(prev => prev.map(c => 
                c.id === contractId ? {
                    ...c,
                    isExpanded: true,
                    relatedData: {
                        ...relatedData,
                        isLoading: false
                    }
                } : c
            ));
        } catch (err) {
            await error('ContractManager', 'Failed to load related data', err);
            // Reset expansion on error
            setFilteredContracts(prev => prev.map(c => 
                c.id === contractId ? { ...c, isExpanded: false } : c
            ));
        }
    };

    // Function to toggle edit mode
    const toggleEditMode = (contractId: string) => {
        setFilteredContracts(prev => prev.map(contract => 
            contract.id === contractId 
                ? { 
                    ...contract, 
                    isEditing: !contract.isEditing,
                    editedValues: contract.isEditing ? undefined : { ...contract }
                }
                : contract
        ));
    };

    // Function to save edited values
    const saveEditedValues = async (contractId: string) => {
        const contract = filteredContracts.find(c => c.id === contractId);
        if (!contract?.editedValues) return;

        try {
            await storeContract({
                ...contract,
                ...contract.editedValues
            });
            
            setFilteredContracts(prev => prev.map(c => 
                c.id === contractId 
                    ? { 
                        ...c, 
                        ...contract.editedValues,
                        isEditing: false,
                        editedValues: undefined
                    }
                    : c
            ));

            await info('ContractManager', 'Contract updated successfully');
        } catch (err) {
            await error('ContractManager', 'Failed to update contract', err);
        }
    };

    // Function to handle value changes
    const handleValueChange = (contractId: string, field: keyof Contract, value: any) => {
        setFilteredContracts(prev => prev.map(contract => 
            contract.id === contractId 
                ? { 
                    ...contract,
                    editedValues: {
                        ...contract.editedValues,
                        [field]: value
                    }
                }
                : contract
        ));
    };

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
                                                <>
                                                    <TableRow key={contract.id || index} className={contract.isEditing ? 'bg-muted/50' : ''}>
                                                        <TableCell className="w-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => toggleRowExpansion(contract.id)}
                                                            >
                                                                {contract.isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>{contract.id}</TableCell>
                                                        <TableCell>
                                                            {contract.isEditing ? (
                                                                <Input
                                                                    value={contract.editedValues?.avtaleKontor || contract.avtaleKontor || ''}
                                                                    onChange={(e) => handleValueChange(contract.id, 'avtaleKontor', e.target.value)}
                                                                    className="h-8"
                                                                />
                                                            ) : (
                                                                contract.avtaleKontor || '-'
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {contract.isEditing ? (
                                                                <Input
                                                                    value={contract.editedValues?.avtaleNavn || contract.avtaleNavn || ''}
                                                                    onChange={(e) => handleValueChange(contract.id, 'avtaleNavn', e.target.value)}
                                                                    className="h-8"
                                                                />
                                                            ) : (
                                                                contract.avtaleNavn || '-'
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {contract.isEditing ? (
                                                                <Input
                                                                    value={contract.editedValues?.type || contract.type || ''}
                                                                    onChange={(e) => handleValueChange(contract.id, 'type', e.target.value)}
                                                                    className="h-8"
                                                                />
                                                            ) : (
                                                                contract.type || '-'
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{contract.validTransport || '-'}</TableCell>
                                                        <TableCell>
                                                            {contract.startLocation ? (
                                                                <>
                                                                    {contract.startLocation.city} ({contract.startLocation.postalCode})
                                                                </>
                                                            ) : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => toggleEditMode(contract.id)}
                                                                    title={contract.isEditing ? t('common.cancel', language) : t('common.edit', language)}
                                                                >
                                                                    {contract.isEditing ? (
                                                                        <X className="h-4 w-4" />
                                                                    ) : (
                                                                        <EditIcon className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                {contract.isEditing && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => saveEditedValues(contract.id)}
                                                                        title={t('common.save', language)}
                                                                    >
                                                                        <Save className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {contract.isExpanded && (
                                                        <TableRow>
                                                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                                                                {contract.relatedData?.isLoading ? (
                                                                    <div className="flex justify-center p-4">
                                                                        <Loader2 className="h-6 w-6 animate-spin" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-6">
                                                                        {/* Area Information */}
                                                                        {contract.relatedData?.area && (
                                                                            <div>
                                                                                <h4 className="font-medium mb-2">{t('contracts.areaDetails', language)}</h4>
                                                                                <dl className="grid grid-cols-3 gap-4">
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">{t('contracts.avtaleKontor', language)}</dt>
                                                                                        <dd>{contract.relatedData.area.avtaleKontor || '-'}</dd>
                                                                                    </div>
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">{t('contracts.avtaleNavn', language)}</dt>
                                                                                        <dd>{contract.relatedData.area.avtaleNavn || '-'}</dd>
                                                                                    </div>
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">{t('contracts.henteOmrade', language)}</dt>
                                                                                        <dd>{contract.relatedData.area.henteOmrade || '-'}</dd>
                                                                                    </div>
                                                                                </dl>
                                                                            </div>
                                                                        )}

                                                                        {/* Contract Type Information */}
                                                                        {contract.relatedData?.contractType && (
                                                                            <div>
                                                                                <h4 className="font-medium mb-2">{t('contracts.typeDetails', language)}</h4>
                                                                                <dl className="grid grid-cols-3 gap-4">
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">KI</dt>
                                                                                        <dd>{contract.relatedData.contractType.ki || '0'}</dd>
                                                                                    </div>
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">KK</dt>
                                                                                        <dd>{contract.relatedData.contractType.kk || '0'}</dd>
                                                                                    </div>
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">{t('contracts.contractType', language)}</dt>
                                                                                        <dd>{contract.relatedData.contractType.kontrakttype || '-'}</dd>
                                                                                    </div>
                                                                                </dl>
                                                                            </div>
                                                                        )}

                                                                        {/* Resources Information */}
                                                                        {contract.relatedData?.resources && contract.relatedData.resources.length > 0 && (
                                                                            <div>
                                                                                <h4 className="font-medium mb-2">{t('contracts.resourceDetails', language)}</h4>
                                                                                <div className="overflow-x-auto">
                                                                                    <table className="min-w-full divide-y divide-border">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                                                                                                    {t('contracts.transportor', language)}
                                                                                                </th>
                                                                                                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                                                                                                    {t('contracts.amount', language)}
                                                                                                </th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="divide-y divide-border">
                                                                                            {contract.relatedData.resources.map((resource, idx) => (
                                                                                                <tr key={idx}>
                                                                                                    <td className="px-4 py-2">{resource.avtaleTransportor || '-'}</td>
                                                                                                    <td className="px-4 py-2">{resource.antall || '0'}</td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Location Information */}
                                                                        {contract.relatedData?.location && (
                                                                            <div>
                                                                                <h4 className="font-medium mb-2">{t('contracts.locationDetails', language)}</h4>
                                                                                <dl className="grid grid-cols-2 gap-4">
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">{t('contracts.city', language)}</dt>
                                                                                        <dd>{contract.startLocation?.city || '-'}</dd>
                                                                                    </div>
                                                                                    <div>
                                                                                        <dt className="text-sm text-muted-foreground">{t('contracts.postalCode', language)}</dt>
                                                                                        <dd>{contract.startLocation?.postalCode || '-'}</dd>
                                                                                    </div>
                                                                                </dl>
                                                                            </div>
                                                                        )}

                                                                        {/* Contract Content Information */}
                                                                        {contract.relatedData?.contractContent && (
                                                                            <div>
                                                                                <h4 className="font-medium mb-2">{t('contracts.contentDetails', language)}</h4>
                                                                                <pre className="text-sm bg-muted p-2 rounded-lg overflow-auto">
                                                                                    {JSON.stringify(contract.relatedData.contractContent, null, 2)}
                                                                                </pre>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
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
                                            await refreshDbInfo();
                                            const loadedContracts = await searchContracts({});
                                            setContracts(loadedContracts);
                                            setFilteredContracts(loadedContracts);
                                            setStats({
                                                avtaleKontorer: [],
                                                types: []
                                            });
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