"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLatestJson, reorderJson } from '@/app/actions/dashboard-actions';
import { FileJson, Filter, ArrowUpDown } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Contract {
    id: string;
    avtaleKontor: string;
    avtaleNavn: string;
    type: string;
    resourceCount: number;
    [key: string]: any;
}

export default function JsonViewerPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [availableFields, setAvailableFields] = useState<string[]>([]);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [fieldOrder, setFieldOrder] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getLatestJson();
        if (data?.contracts) {
            setContracts(data.contracts);
            setFilteredContracts(data.contracts);

            // Get all unique fields from contracts
            const fields = new Set<string>();
            data.contracts.forEach(contract => {
                Object.keys(contract).forEach(key => fields.add(key));
            });
            setAvailableFields(Array.from(fields));

            // Set initial field order
            setFieldOrder(Array.from(fields));
        }
    };

    useEffect(() => {
        let filtered = [...contracts];

        // Apply filters
        Object.entries(filters).forEach(([field, value]) => {
            if (value) {
                filtered = filtered.filter(contract =>
                    String(contract[field]).toLowerCase().includes(value.toLowerCase())
                );
            }
        });

        // Apply search term
        if (searchTerm) {
            filtered = filtered.filter(contract =>
                Object.values(contract).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        setFilteredContracts(filtered);
    }, [filters, contracts, searchTerm]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleReorderFields = async () => {
        await reorderJson(fieldOrder);
        await loadData();
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...fieldOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setFieldOrder(newOrder);
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="JSON Viewer"
                description="View, filter, and manage JSON data"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters and Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Input
                            placeholder="Search in all fields..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['avtaleKontor', 'type', 'avtaleNavn'].map(field => (
                                <div key={field} className="space-y-2">
                                    <label className="text-sm font-medium">{field}</label>
                                    <Input
                                        placeholder={`Filter by ${field}...`}
                                        value={filters[field] || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(field, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileJson className="h-5 w-5" />
                            Field Order
                        </div>
                        <Button onClick={handleReorderFields}>
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Apply Order
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fieldOrder.map((field, index) => (
                            <div key={field} className="flex items-center gap-2 bg-secondary/10 p-2 rounded">
                                <span className="flex-1">{field}</span>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveField(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveField(index, 'down')}
                                        disabled={index === fieldOrder.length - 1}
                                    >
                                        ↓
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contracts ({filteredContracts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>AvtaleKontor</TableHead>
                                    <TableHead>AvtaleNavn</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Resources</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContracts.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell>{contract.id}</TableCell>
                                        <TableCell>{contract.avtaleKontor}</TableCell>
                                        <TableCell>{contract.avtaleNavn}</TableCell>
                                        <TableCell>{contract.type}</TableCell>
                                        <TableCell>{contract.resourceCount}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedContract(contract)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Contract Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedContract && Object.entries(selectedContract).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b">
                                <div className="font-medium">{key}</div>
                                <div className="col-span-2">
                                    {typeof value === 'object'
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 