"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileJson, ArrowRight, X, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { saveFile, loadHistory, saveHistory } from "@/app/actions/file-actions";
import { saveLatestJson } from "@/app/actions/dashboard-actions";
import { logToFile, clearLogs, rotateLogs } from '@/app/lib/logger';

interface CSVFile {
    name: string;
    content: string[][];
    headers: string[];
    selectedFields: string[];
    selected: boolean;
    relationships: {
        [key: string]: {
            targetFile: string;
            sourceField: string;
            targetField: string;
        };
    };
}

interface CustomField {
    name: string;
    path: string;
    type: 'string' | 'number' | 'boolean';
    value: any;
}

interface ContractData {
    [key: string]: any;
}

interface Contract {
    id: string;
    hasPaidReturn: boolean;
    cost: {
        costPerKm: number;
        costPerWaitedMinute: number;
        startupCost: number;
        minimumCost: number;
    };
    nodes: {
        id: string;
        postalCodes: {
            pickup: string[];
            delivery: string[];
        };
    }[];
    resourceCount: number;
    type: string;
    validTransport: string;
    validNeeds: string[];
    avtaleKontor: string;
    avtaleNavn: string;
    startLocation: {
        postalCode: string;
        city: string;
        municipality: string;
    };
    [key: string]: any;
}

interface TransformedData {
    contracts: Contract[];
    [key: string]: any;
}

// Standard field names
const STANDARD_FIELDS = {
    AREA_CODE: 'OMRADEKODE',
    CONTRACT_AREA_CODE: 'AVTALEOMRADEKODE',
    PICKUP_AREA: 'HENTEOMRADE',
    DELIVERY_AREA: 'LEVERINGOMRADE',
    RESOURCE_COUNT: 'ANTALL',
    TYPE: 'TYPE',
    TRANSPORT: 'GYLDIGTRANSPORT',
    NEEDS: 'GYLDIGBEHOV',
    COST_PER_KM: 'KMPRIS',
    MIN_COST: 'MINPRIS',
    STARTUP_COST: 'STARTTAKST',
    OFFICE: 'AVTALEKONTOR',
    TRANSPORTER: 'AVTALENAVN',
    START_POSTAL_CODE: 'STARTPOSTNR',
    START_CITY: 'STARTPOSTSTED',
    MUNICIPALITY: 'KOMMUNE'
} as const;

// Helper function to normalize field names
const normalizeFieldName = (field: string): string => {
    return field.trim().toUpperCase().replace(/\s+/g, '');
};

// Helper function to find field in headers
const findField = (headers: string[], standardField: string): string | undefined => {
    const normalizedStandard = normalizeFieldName(standardField);
    return headers.find(h => normalizeFieldName(h) === normalizedStandard);
};

// Helper function to clean postal code ranges
const cleanPostalRanges = (rangeStr: string): string[] => {
    return rangeStr
        .split(',')
        .map(range => range.trim())
        .map(range => {
            // Remove quotes and any \r
            range = range.replace(/"/g, '').replace(/\r/g, '');

            // If it's a single number, pad it
            if (!range.includes('-')) {
                return range.padStart(4, '0');
            }

            // If it's a range, pad both numbers
            const [start, end] = range.split('-');
            return `${start.padStart(4, '0')}-${end.padStart(4, '0')}`;
        })
        .filter(Boolean); // Remove empty entries
};

export default function ImportPage() {
    const [files, setFiles] = useState<CSVFile[]>([]);
    const [step, setStep] = useState<'upload' | 'fields' | 'relationships'>('upload');
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [previewContent, setPreviewContent] = useState<{ content: string; name: string } | null>(null);
    const [outputFileName, setOutputFileName] = useState<string>('');
    const [editedPreviewContent, setEditedPreviewContent] = useState<string>('');
    const [isPreviewEditing, setIsPreviewEditing] = useState(false);

    const getDefaultField = (headers: string[]): string => {
        const normalizedHeaders = headers.map(normalizeFieldName);
        const possibleFields = [
            STANDARD_FIELDS.AREA_CODE,
            STANDARD_FIELDS.CONTRACT_AREA_CODE
        ];

        for (const field of possibleFields) {
            const index = normalizedHeaders.indexOf(field);
            if (index !== -1) {
                return headers[index];
            }
        }

        return '';
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList) return;

        Array.from(fileList).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const rows = normalizedText.split('\n').map(row =>
                    row.split(',').map(cell =>
                        cell.trim()
                            .replace(/^"/, '')
                            .replace(/"$/, '')
                            .replace(/\r/g, '')
                    )
                );
                const headers = rows[0];
                const content = rows.slice(1).filter(row => row.some(cell => cell.trim()));

                setFiles(prev => {
                    const newFile: CSVFile = {
                        name: file.name,
                        content,
                        headers,
                        selectedFields: [...headers],
                        selected: true,
                        relationships: {}
                    };

                    // Set up default relationships for the new file
                    prev.forEach(existingFile => {
                        const sourceDefaultField = getDefaultField(headers);
                        const targetDefaultField = getDefaultField(existingFile.headers);

                        if (sourceDefaultField || targetDefaultField) {
                            newFile.relationships[existingFile.name] = {
                                targetFile: existingFile.name,
                                sourceField: sourceDefaultField,
                                targetField: targetDefaultField
                            };

                            // Also update the existing file's relationships
                            const updatedExistingFile = { ...existingFile };
                            updatedExistingFile.relationships[newFile.name] = {
                                targetFile: newFile.name,
                                sourceField: targetDefaultField,
                                targetField: sourceDefaultField
                            };
                        }
                    });

                    return [...prev, newFile];
                });
            };
            reader.readAsText(file);
        });
    };

    const toggleField = (fileName: string, field: string) => {
        setFiles(prev => prev.map(file => {
            if (file.name === fileName) {
                const newSelectedFields = file.selectedFields.includes(field)
                    ? file.selectedFields.filter(f => f !== field)
                    : [...file.selectedFields, field];
                return { ...file, selectedFields: newSelectedFields };
            }
            return file;
        }));
    };

    const addRelationship = (sourceFile: string, targetFile: string, sourceField: string, targetField: string) => {
        setFiles(prev => prev.map(file => {
            if (file.name === sourceFile) {
                return {
                    ...file,
                    relationships: {
                        ...file.relationships,
                        [targetFile]: {
                            targetFile,
                            sourceField,
                            targetField
                        }
                    }
                };
            }
            return file;
        }));
    };

    const addCustomField = () => {
        setCustomFields(prev => [...prev, {
            name: '',
            path: 'contracts[]',
            type: 'string',
            value: ''
        }]);
    };

    const updateCustomField = (index: number, field: Partial<CustomField>) => {
        setCustomFields(prev => prev.map((f, i) =>
            i === index ? { ...f, ...field } : f
        ));
    };

    const removeCustomField = (index: number) => {
        setCustomFields(prev => prev.filter((_, i) => i !== index));
    };

    const setAllToOmradekode = () => {
        const updatedFiles = files.map(file => ({
            ...file,
            relationships: {} as CSVFile['relationships'] // Reset relationships with proper type
        }));

        // For each pair of files
        for (let i = 0; i < updatedFiles.length; i++) {
            for (let j = 0; j < updatedFiles.length; j++) {
                if (i !== j) {
                    const sourceFile = updatedFiles[i];
                    const targetFile = updatedFiles[j];

                    // Get the area code fields for both files
                    const sourceField = getDefaultField(sourceFile.headers);
                    const targetField = getDefaultField(targetFile.headers);

                    if (sourceField && targetField) {
                        // Set up bidirectional relationship
                        sourceFile.relationships[targetFile.name] = {
                            targetFile: targetFile.name,
                            sourceField: sourceField,
                            targetField: targetField
                        };
                    }
                }
            }
        }

        setFiles(updatedFiles);
    };

    // Helper function to normalize area codes for matching
    const normalizeAreaCode = (code: string | number): string => {
        // Convert to string if number
        const strCode = String(code);
        return strCode
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '')  // Remove all spaces
            .replace(/[^A-Z0-9\-]/g, '');  // Keep only letters, numbers, and dashes
    };

    // Helper function to check if two area codes match
    const areCodesMatching = (code1: string | number, code2: string | number): boolean => {
        return normalizeAreaCode(code1) === normalizeAreaCode(code2);
    };

    const handleGenerateJSON = async () => {
        try {
            await clearLogs();
            await logToFile('Starting JSON generation');

            const contractFile = files.find(f => f.name.toLowerCase() === 'avtaleinnhold.csv');
            const areaFile = files.find(f => f.name.toLowerCase() === 'omrade.csv');
            const resourceFile = files.find(f => f.name.toLowerCase() === 'ressurser.csv');
            const typeFile = files.find(f => f.name.toLowerCase() === 'type_kikk.csv');
            const startLocationFile = files.find(f => f.name.toLowerCase() === 'startsted.csv');

            if (!contractFile) {
                await logToFile('Error: Missing required file avtaleinnhold.csv');
                alert('Mangler nødvendig fil: avtaleinnhold.csv');
                return;
            }

            await logToFile('Files found', {
                contract: contractFile?.name,
                area: areaFile?.name,
                resource: resourceFile?.name,
                type: typeFile?.name
            });

            // Create maps for lookups
            const areaPostalCodes = new Map<string, { pickup: string[]; delivery: string[] }>();
            const resourceCounts = new Map<string, number>();
            const areaInfo = new Map<string, { office: string; transporter: string }>();
            const startLocations = new Map<string, { postalCode: string; city: string; municipality: string }>();

            // Process start location data
            if (startLocationFile) {
                const areaCodeIndex = startLocationFile.headers.findIndex(h =>
                    normalizeFieldName(h) === STANDARD_FIELDS.AREA_CODE
                );
                const postalCodeIndex = startLocationFile.headers.findIndex(h =>
                    normalizeFieldName(h) === STANDARD_FIELDS.START_POSTAL_CODE
                );
                const cityIndex = startLocationFile.headers.findIndex(h =>
                    normalizeFieldName(h) === STANDARD_FIELDS.START_CITY
                );
                const municipalityIndex = startLocationFile.headers.findIndex(h =>
                    normalizeFieldName(h) === STANDARD_FIELDS.MUNICIPALITY
                );

                if (areaCodeIndex !== -1) {
                    for (const row of startLocationFile.content) {
                        if (!row[areaCodeIndex]) continue;

                        const areaCode = row[areaCodeIndex].trim();
                        const normalizedCode = normalizeAreaCode(areaCode);

                        startLocations.set(normalizedCode, {
                            postalCode: row[postalCodeIndex]?.trim() || '',
                            city: row[cityIndex]?.trim() || '',
                            municipality: row[municipalityIndex]?.trim() || ''
                        });
                    }
                }
            }

            // Process area data
            if (areaFile) {
                const areaCodeIndex = areaFile.headers.findIndex(h =>
                    normalizeFieldName(h) === STANDARD_FIELDS.AREA_CODE
                );
                const officeIndex = areaFile.headers.findIndex(h =>
                    normalizeFieldName(h) === STANDARD_FIELDS.OFFICE
                );
                const transporterIndex = areaFile.headers.findIndex(h =>
                    normalizeFieldName(h) === STANDARD_FIELDS.TRANSPORTER
                );

                if (areaCodeIndex !== -1) {
                    for (const row of areaFile.content) {
                        if (!row[areaCodeIndex]) continue;

                        const areaCode = row[areaCodeIndex].trim();
                        const normalizedCode = normalizeAreaCode(areaCode);

                        areaInfo.set(normalizedCode, {
                            office: row[officeIndex]?.trim() || '',
                            transporter: row[transporterIndex]?.trim() || ''
                        });
                    }
                }
            }

            // Process contract data
            const contracts = contractFile.content
                .filter(row => row.some(cell => cell.trim()))
                .map(async (row, index) => {
                    const contractData: Record<string, any> = {};
                    contractFile.headers.forEach((header, index) => {
                        const value = row[index]?.trim();
                        if (value !== undefined && value !== '' && contractFile.selectedFields.includes(header)) {
                            if (!isNaN(Number(value)) && header.toLowerCase() !== 'omradekode') {
                                contractData[header] = parseFloat(value);
                            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                                contractData[header] = value.toLowerCase() === 'true';
                            } else {
                                contractData[header] = value;
                            }
                        }
                    });

                    const areaCode = contractData['OmradeKode'] ||
                        contractData[contractFile.headers.find(h => normalizeFieldName(h) === STANDARD_FIELDS.AREA_CODE) || ''];

                    if (!areaCode) {
                        await logToFile('Missing area code for contract', contractData);
                        return null;
                    }

                    const normalizedAreaCode = normalizeAreaCode(areaCode);
                    const areaPostalData = areaPostalCodes.get(normalizedAreaCode);

                    await logToFile('Contract processing', {
                        index,
                        areaCode: {
                            original: areaCode,
                            normalized: normalizedAreaCode,
                            hasPostalData: !!areaPostalData
                        }
                    });

                    // Create contract object
                    return {
                        id: normalizedAreaCode,
                        hasPaidReturn: false,
                        cost: {
                            costPerKm: contractData[findField(contractFile.headers, STANDARD_FIELDS.COST_PER_KM) || ''] || 0,
                            costPerWaitedMinute: 0,
                            startupCost: contractData[findField(contractFile.headers, STANDARD_FIELDS.STARTUP_COST) || ''] || 0,
                            minimumCost: contractData[findField(contractFile.headers, STANDARD_FIELDS.MIN_COST) || ''] || 0
                        },
                        nodes: [
                            {
                                id: areaCode,
                                postalCodes: areaPostalData || { pickup: [], delivery: [] }
                            }
                        ],
                        resourceCount: resourceCounts.get(normalizedAreaCode) || 0,
                        type: contractData[findField(contractFile.headers, STANDARD_FIELDS.TYPE) || ''] || '',
                        validTransport: contractData[findField(contractFile.headers, STANDARD_FIELDS.TRANSPORT) || ''] || '',
                        validNeeds: (contractData[findField(contractFile.headers, STANDARD_FIELDS.NEEDS) || ''] || '')
                            .split(';')
                            .filter(Boolean)
                            .map((need: string) => need.trim()),
                        // Add area info
                        avtaleKontor: areaInfo.get(normalizedAreaCode)?.office || '',
                        avtaleNavn: areaInfo.get(normalizedAreaCode)?.transporter || '',
                        // Add start location info
                        startLocation: startLocations.get(normalizedAreaCode) || {
                            postalCode: '',
                            city: '',
                            municipality: ''
                        }
                    };
                });

            const resolvedContracts = (await Promise.all(contracts)).filter((contract): contract is Contract =>
                contract !== null &&
                contract.id !== undefined
            );

            await logToFile('Contracts processed', {
                total: contractFile.content.length,
                valid: resolvedContracts.length,
                invalid: contractFile.content.length - resolvedContracts.length
            });

            // Create the final result
            const result: TransformedData = {
                contracts: resolvedContracts
            };

            // Apply custom fields and save
            const finalResult = applyCustomFields(result);
            const formattedJson = JSON.stringify(finalResult, null, 2);

            if (!finalResult.contracts || finalResult.contracts.length === 0) {
                await logToFile('Error: No valid contracts found');
                alert('Ingen gyldige kontrakter funnet. Sjekk at alle nødvendige felter er valgt og at relasjonene er korrekte.');
                return;
            }

            // Save and show preview
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = outputFileName || `transformed_data_${timestamp}.json`;

                await saveFile(fileName, formattedJson);
                await saveLatestJson(formattedJson);

                let history = await loadHistory();
                history.unshift({
                    id: timestamp,
                    fileName,
                    date: new Date().toISOString(),
                    fileSize: formattedJson.length,
                    files: files.map(f => f.name)
                });
                await saveHistory(history);

                await logToFile('JSON generation completed', {
                    fileName,
                    contractCount: finalResult.contracts.length
                });

                setPreviewContent({ content: formattedJson, name: fileName });
            } catch (error) {
                await logToFile('Error saving file', { error });
                alert('Det oppstod en feil ved lagring av filen');
            }

            await rotateLogs();  // Rotate logs if they're too large
        } catch (error) {
            await logToFile('Unexpected error during JSON generation', { error });
            alert('Det oppstod en uventet feil under generering av JSON');
        }
    };

    const getSampleData = (file: CSVFile, header: string) => {
        const columnIndex = file.headers.indexOf(header);
        return file.content
            .slice(0, 5)
            .map(row => row[columnIndex])
            .filter(Boolean);
    };

    const handlePreviewEdit = () => {
        if (!previewContent) return;
        setEditedPreviewContent(JSON.stringify(JSON.parse(previewContent.content), null, 2));
        setIsPreviewEditing(true);
    };

    const handleSavePreviewEdit = async () => {
        try {
            // Validate JSON
            JSON.parse(editedPreviewContent);

            // Update preview content
            if (previewContent) {
                const newPreviewContent = {
                    ...previewContent,
                    content: editedPreviewContent
                };
                setPreviewContent(newPreviewContent);

                // Save the edited file
                await saveFile(previewContent.name, editedPreviewContent);
            }

            setIsPreviewEditing(false);
        } catch (error) {
            alert('Invalid JSON format');
        }
    };

    const applyCustomFields = (json: TransformedData): TransformedData => {
        const result = { ...json };

        customFields.forEach(field => {
            const paths = field.path.split('.');
            let current = result;

            // Handle array paths and nested objects
            for (let i = 0; i < paths.length - 1; i++) {
                const path = paths[i];
                if (path.includes('[]')) {
                    const arrayPath = path.replace('[]', '');
                    if (Array.isArray(current[arrayPath])) {
                        current[arrayPath].forEach((item: any) => {
                            if (!item[paths[i + 1]]) {
                                item[paths[i + 1]] = {};
                            }
                        });
                        current = current[arrayPath][0];
                    }
                } else {
                    if (!current[path]) {
                        current[path] = {};
                    }
                    current = current[path];
                }
            }

            const lastPath = paths[paths.length - 1];
            const value = field.type === 'number' ? Number(field.value) :
                field.type === 'boolean' ? Boolean(field.value) :
                    String(field.value);

            if (lastPath.includes('[]')) {
                const arrayPath = lastPath.replace('[]', '');
                if (result.contracts) {
                    result.contracts.forEach(contract => {
                        contract[arrayPath] = value;
                    });
                }
            } else {
                current[lastPath] = value;
            }
        });

        return result;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <PageHeader
                    title="Import CSV Filer"
                    description="Last opp og konfigurer CSV-filer for import"
                />
            </div>

            <Card className="border-brand-secondary/20">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileJson className="h-5 w-5 text-brand-secondary" />
                        {step === 'upload' ? 'Last opp filer' :
                            step === 'fields' ? 'Velg felter' :
                                'Konfigurer relasjoner'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {step === 'upload' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-brand-secondary/20 rounded-lg p-8 text-center">
                                <input
                                    type="file"
                                    accept=".csv"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                >
                                    <Upload className="h-8 w-8 text-brand-secondary" />
                                    <span className="text-sm text-muted-foreground">
                                        Klikk for å laste opp CSV-filer eller dra og slipp dem her
                                    </span>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Opplastede filer:</h3>
                                    {files.map(file => (
                                        <div key={file.name} className="flex items-center justify-between p-2 bg-brand-secondary/5 rounded">
                                            <span>{file.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {file.content.length} rader
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setFiles(prev => prev.filter(f => f.name !== file.name))}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        className="w-full mt-4 bg-brand-primary text-white hover:bg-brand-primary/90"
                                        onClick={() => setStep('fields')}
                                    >
                                        Fortsett til feltvalg
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'fields' && (
                        <div className="space-y-6">
                            {files.map(file => (
                                <div key={file.name} className="space-y-2">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <FileJson className="h-4 w-4 text-brand-secondary" />
                                        {file.name}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {file.headers.map(header => (
                                            <TooltipProvider key={header}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${file.name}-${header}`}
                                                                checked={file.selectedFields.includes(header)}
                                                                onCheckedChange={() => toggleField(file.name, header)}
                                                            />
                                                            <label
                                                                htmlFor={`${file.name}-${header}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {header}
                                                            </label>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="w-64 p-2">
                                                        <p className="font-medium mb-1">Eksempeldata:</p>
                                                        <div className="text-sm space-y-1">
                                                            {getSampleData(file, header).map((sample, index) => (
                                                                <div key={index} className="text-muted-foreground">
                                                                    {sample}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('upload')}
                                >
                                    Tilbake
                                </Button>
                                <Button
                                    className="bg-brand-primary text-white hover:bg-brand-primary/90"
                                    onClick={() => setStep('relationships')}
                                >
                                    Fortsett til relasjoner
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'relationships' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4">
                                <div className="bg-brand-secondary/5 p-4 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <AlertCircle className="h-5 w-5 text-brand-secondary mt-1" />
                                        <div>
                                            <h3 className="font-medium mb-2">Koble sammen filene</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                For å generere JSON trenger vi å vite hvordan filene henger sammen.
                                                Vi har funnet noen forslag til koblinger basert på feltnavnene.
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={setAllToOmradekode}
                                                className="w-full bg-white hover:bg-gray-50 border-brand-secondary/20 flex items-center justify-center gap-2"
                                            >
                                                <Check className="h-4 w-4 text-green-500" />
                                                Bruk automatisk oppdagede koblinger
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Card>
                                    <CardContent className="pt-6">
                                        {files.map((sourceFile, index) => {
                                            const hasValidRelationships = files
                                                .filter(f => f.name !== sourceFile.name)
                                                .every(targetFile => {
                                                    const relationship = sourceFile.relationships[targetFile.name];
                                                    return relationship?.sourceField && relationship?.targetField;
                                                });

                                            return (
                                                <div key={sourceFile.name} className="mb-8 last:mb-0">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <FileJson className="h-5 w-5 text-brand-secondary" />
                                                        <h3 className="font-medium">{sourceFile.name}</h3>
                                                        {hasValidRelationships && (
                                                            <div className="ml-auto flex items-center gap-1 text-green-500 text-sm">
                                                                <Check className="h-4 w-4" />
                                                                Koblet
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4 pl-7">
                                                        {files.filter(f => f.name !== sourceFile.name).map(targetFile => {
                                                            const relationship = sourceFile.relationships[targetFile.name] || {
                                                                sourceField: getDefaultField(sourceFile.headers),
                                                                targetField: getDefaultField(targetFile.headers)
                                                            };

                                                            const isValid = relationship.sourceField && relationship.targetField;

                                                            return (
                                                                <div key={targetFile.name}
                                                                    className={`p-4 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-sm font-medium">{targetFile.name}</span>
                                                                        {isValid ? (
                                                                            <div className="ml-auto flex items-center gap-1 text-green-600 text-sm">
                                                                                <Check className="h-4 w-4" />
                                                                                Gyldig kobling
                                                                            </div>
                                                                        ) : (
                                                                            <div className="ml-auto flex items-center gap-1 text-orange-600 text-sm">
                                                                                <AlertCircle className="h-4 w-4" />
                                                                                Mangler kobling
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="text-sm text-muted-foreground block mb-1.5">
                                                                                Felt fra {sourceFile.name}
                                                                            </label>
                                                                            <select
                                                                                className="w-full p-2 rounded border bg-white"
                                                                                value={relationship.sourceField}
                                                                                onChange={(e) => {
                                                                                    addRelationship(
                                                                                        sourceFile.name,
                                                                                        targetFile.name,
                                                                                        e.target.value,
                                                                                        relationship.targetField
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <option value="">Velg felt</option>
                                                                                {sourceFile.headers.map(header => (
                                                                                    <option key={header} value={header}>
                                                                                        {header}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>

                                                                        <div>
                                                                            <label className="text-sm text-muted-foreground block mb-1.5">
                                                                                Felt fra {targetFile.name}
                                                                            </label>
                                                                            <select
                                                                                className="w-full p-2 rounded border bg-white"
                                                                                value={relationship.targetField}
                                                                                onChange={(e) => {
                                                                                    addRelationship(
                                                                                        sourceFile.name,
                                                                                        targetFile.name,
                                                                                        relationship.sourceField,
                                                                                        e.target.value
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <option value="">Velg felt</option>
                                                                                {targetFile.headers.map(header => (
                                                                                    <option key={header} value={header}>
                                                                                        {header}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('fields')}
                                >
                                    Tilbake
                                </Button>
                                <Button
                                    className="bg-brand-primary text-white hover:bg-brand-primary/90"
                                    onClick={handleGenerateJSON}
                                >
                                    Generer JSON
                                    <Check className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={previewContent !== null} onOpenChange={() => {
                setPreviewContent(null);
                setIsPreviewEditing(false);
            }}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col" aria-describedby="dialog-description">
                    <DialogTitle>JSON Forhåndsvisning</DialogTitle>
                    <div id="dialog-description" className="sr-only">
                        Forhåndsvisning av generert JSON-fil med mulighet for redigering og nedlasting
                    </div>
                    <div className="flex-1 overflow-auto">
                        <div className="sticky top-0 flex justify-between items-center bg-background py-2 mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileJson className="h-5 w-5 text-brand-secondary" />
                                {previewContent?.name}
                            </h2>
                            <div className="flex gap-2">
                                {isPreviewEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsPreviewEditing(false)}
                                        >
                                            Avbryt
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSavePreviewEdit}
                                        >
                                            Lagre
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (previewContent) {
                                                    navigator.clipboard.writeText(previewContent.content)
                                                        .then(() => alert('Kopiert til utklippstavle!'))
                                                        .catch(err => console.error('Feil ved kopiering:', err));
                                                }
                                            }}
                                        >
                                            Kopier
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePreviewEdit}
                                        >
                                            Rediger
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (previewContent) {
                                                    const blob = new Blob([previewContent.content], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = previewContent.name;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);
                                                }
                                            }}
                                        >
                                            Last ned
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {isPreviewEditing ? (
                            <textarea
                                className="w-full h-[calc(100vh-15rem)] p-4 font-mono text-sm bg-secondary/10 rounded-lg"
                                value={editedPreviewContent}
                                onChange={(e) => setEditedPreviewContent(e.target.value)}
                            />
                        ) : (
                            <pre className="bg-secondary/10 p-4 rounded-lg overflow-auto">
                                <code className="text-sm">
                                    {previewContent ? JSON.stringify(JSON.parse(previewContent.content), null, 2) : ''}
                                </code>
                            </pre>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 