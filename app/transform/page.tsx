"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { error, info } from '@/app/lib/client-logger';
import { PageHeader } from '@/components/layout/page-header';
import { t } from '@/app/lib/i18n';
import { useLanguage } from '@/components/theme/language-provider';
import { Button } from '@/components/ui/button';
import { Upload, FileUp } from 'lucide-react';
import { Area, ContractType, Resource, Location, ContractContent, DataType } from '@/types';
import { 
    storeArea, storeAreas,
    storeContractType, storeContractTypes,
    storeResource, storeResources,
    storeLocation, storeLocations,
    storeContractContent, storeContractContents,
    storeDataFile,
    storeRelation
} from '@/app/lib/db';

interface FileUploadStatus {
    filename: string;
    type: DataType;
    status: 'pending' | 'processing' | 'success' | 'error';
    message?: string;
}

const parseCSV = (content: string): any[] => {
    const lines = content.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const row: any = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }

    return data;
};

const detectFileType = (filename: string, headers: string[]): DataType | null => {
    const name = filename.toLowerCase();
    
    // Map filenames to types
    const fileTypeMap: Record<string, DataType> = {
        'omrade.csv': 'area',
        'type_kikk.csv': 'contractType',
        'ressurser.csv': 'resource',
        'startsted.csv': 'location',
        'avtaleinnhold.csv': 'contractContent',
        'omradekode_antallloyver.csv': 'resource',  // This is also a resource file
        'transportor_antallloyver.csv': 'resource'  // This is also a resource file
    };

    // Try exact match first
    if (fileTypeMap[name]) {
        return fileTypeMap[name];
    }

    // If no exact match, try partial match
    if (name.includes('omrade')) return 'area';
    if (name.includes('type')) return 'contractType';
    if (name.includes('ressurser') || name.includes('loyver')) return 'resource';
    if (name.includes('startsted')) return 'location';
    if (name.includes('avtaleinnhold')) return 'contractContent';

    return null;
};

const processFile = async (file: File): Promise<FileUploadStatus> => {
    const status: FileUploadStatus = {
        filename: file.name,
        type: 'area', // Will be updated
        status: 'pending'
    };

    try {
        const content = await file.text();
        const data = parseCSV(content);
        
        if (data.length === 0) {
            status.status = 'error';
            status.message = 'No data found in file';
            return status;
        }

        const headers = Object.keys(data[0]);
        const type = detectFileType(file.name, headers);
        
        if (!type) {
            status.status = 'error';
            status.message = 'Unknown file type';
            return status;
        }

        status.type = type;
        status.status = 'processing';

        // Store raw file data
        await storeDataFile({
            id: crypto.randomUUID(),
            type,
            filename: file.name,
            content,
            timestamp: Date.now()
        });

        // Process and store typed data
        switch (type) {
            case 'area':
                await storeAreas(data.map(row => ({
                    id: crypto.randomUUID(),
                    avtaleKontor: row.AvtaleKontor || '',
                    avtaleNavn: row.AvtaleNavn || '',
                    omradeKode: row.OmradeKode || '',
                    henteOmrade: row.HenteOmrade || '',
                    leveringOmrade: row.LeveringOmrade || '',
                    timestamp: Date.now()
                })));
                break;

            case 'contractType':
                await storeContractTypes(data.map(row => ({
                    id: crypto.randomUUID(),
                    omradeKode: row.Omradekode || '',
                    ki: parseInt(row.KI) || 0,
                    kk: parseInt(row.KK) || 0,
                    andelKK: row['Andel KK'] || '',
                    kontrakttype: row.kontrakttype || '',
                    timestamp: Date.now()
                })));
                break;

            case 'resource':
                // Handle different resource file formats
                if (file.name.includes('omradekode_antallloyver')) {
                    await storeResources(data.map(row => ({
                        id: crypto.randomUUID(),
                        avtaleKontor: '',  // Not available in this file
                        avtaleTransportor: '',  // Not available in this file
                        avtaleOmradeKode: row.Omradekode || '',
                        avtaleOmradeNavn: '',  // Not available in this file
                        antall: parseInt(row.antall) || 0,
                        timestamp: Date.now()
                    })));
                } else if (file.name.includes('transportor_antallloyver')) {
                    await storeResources(data.map(row => ({
                        id: crypto.randomUUID(),
                        avtaleKontor: '',  // Not available in this file
                        avtaleTransportor: row.Transportor || '',
                        avtaleOmradeKode: '',  // Not available in this file
                        avtaleOmradeNavn: '',  // Not available in this file
                        antall: parseInt(row.antall) || 0,
                        timestamp: Date.now()
                    })));
                } else {
                    await storeResources(data.map(row => ({
                        id: crypto.randomUUID(),
                        avtaleKontor: row.AvtaleKontor || '',
                        avtaleTransportor: row.AvtaleTransportor || '',
                        avtaleOmradeKode: row.AvtaleOmradeKode || '',
                        avtaleOmradeNavn: row.AvtaleOmradeNavn || '',
                        antall: parseInt(row.antall) || 0,
                        timestamp: Date.now()
                    })));
                }
                break;

            case 'location':
                await storeLocations(data.map(row => ({
                    id: crypto.randomUUID(),
                    omradeKode: row.OmradeKode || '',
                    // Add other fields from startsted.csv
                    timestamp: Date.now()
                })));
                break;

            case 'contractContent':
                await storeContractContents(data.map(row => ({
                    id: crypto.randomUUID(),
                    omradeKode: row.OmradeKode || '',
                    // Add other fields from avtaleinnhold.csv
                    timestamp: Date.now()
                })));
                break;
        }

        status.status = 'success';
        return status;
    } catch (err) {
        console.error('Error processing file:', file.name, err);
        status.status = 'error';
        status.message = err instanceof Error ? err.message : 'Unknown error';
        return status;
    }
};

export default function TransformPage() {
    const { language } = useLanguage();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setSelectedFiles(files);
        setFileStatuses([]);
    };

    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        setIsUploading(true);
        const statuses: FileUploadStatus[] = [];

        try {
            for (const file of selectedFiles) {
                const status = await processFile(file);
                statuses.push(status);
                setFileStatuses([...statuses]);
            }

            await info('Transform', t('transform.uploadSuccess', language, { count: statuses.filter(s => s.status === 'success').length }));
        } catch (err) {
            await error('Transform', t('errors.uploadFailed', language), err);
        } finally {
            setIsUploading(false);
            setSelectedFiles(null);
            // Reset the file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title={t('transform.title', language)}
                description={t('transform.description', language)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('transform.uploadTitle', language)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 items-center">
                                    <Input
                                        type="file"
                                        accept=".csv"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="max-w-sm"
                                        aria-label={t('transform.selectFiles', language)}
                                    />
                                    <Button 
                                        onClick={handleUpload}
                                        disabled={!selectedFiles || isUploading}
                                    >
                                        {isUploading ? (
                                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <FileUp className="h-4 w-4 mr-2" />
                                        )}
                                        {t('common.upload', language)}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Required files: omrade.csv, type_kikk.csv, ressurser.csv, startsted.csv, avtaleinnhold.csv
                                </p>
                            </div>

                            {fileStatuses.length > 0 && (
                                <div className="space-y-2">
                                    {fileStatuses.map((status, index) => (
                                        <div
                                            key={index}
                                            className={`p-2 rounded-lg text-sm ${
                                                status.status === 'success'
                                                    ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                    : status.status === 'error'
                                                    ? 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
                                                    : 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                            }`}
                                        >
                                            <div className="font-medium">{status.filename}</div>
                                            <div className="text-xs">
                                                {status.status === 'processing' ? 'Processing...' : status.message || `Processed as ${status.type}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('transform.relationsTitle', language)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] border rounded-lg p-4">
                            {/* Relationship visualization will go here */}
                            <div className="text-center text-muted-foreground">
                                Upload files to view and manage relationships
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 