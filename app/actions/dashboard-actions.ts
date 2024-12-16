"use server";

import { promises as fs } from 'fs';
import path from 'path';

const LATEST_JSON_PATH = path.join(process.cwd(), 'output', 'latest.json');
const CSV_DIR = path.join(process.cwd(), 'uploads');

export interface TransformedData {
    contracts: Contract[];
}

export interface Contract {
    id: string;
    avtaleKontor: string;
    avtaleNavn: string;
    type: string;
    resourceCount: number;
    cost: {
        costPerKm: number;
        minimumCost: number;
    };
    startLocation?: {
        city: string;
        municipality: string;
    };
    validTransport: string;
    validNeeds: string[];
}

export interface LicenseStats {
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

export interface DashboardStats {
    totalContracts: number;
    contractTypes: Record<string, number>;
    totalResources: number;
    averageCostPerKm: number;
    averageMinimumCost: number;
    validTransports: string[];
    validNeeds: string[];
    avtaleKontorStats: Record<string, {
        totalContracts: number;
        transporterCount: number;
        cityCount: number;
        startKommuneCount: number;
        totalResources: number;
        averageCostPerKm: number;
    }>;
    licenseStats: Record<string, LicenseStats>;
}

export async function saveLatestJson(jsonContent: string) {
    try {
        await fs.mkdir(path.join(process.cwd(), 'output'), { recursive: true });
        await fs.writeFile(LATEST_JSON_PATH, jsonContent);
    } catch (error) {
        console.error('Error saving latest JSON:', error);
        throw error;
    }
}

export async function getLatestJson(): Promise<TransformedData | null> {
    try {
        const content = await fs.readFile(LATEST_JSON_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading latest JSON:', error);
        return null;
    }
}

async function readCSVFile(filename: string): Promise<string[][]> {
    try {
        const content = await fs.readFile(path.join(CSV_DIR, filename), 'utf-8');
        return content.split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => line.split(',').map(cell => cell.trim()));
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

async function getLicenseStats(): Promise<Record<string, LicenseStats>> {
    try {
        // Read both CSV files
        const totalLicenses = await readCSVFile('transportor_antallloyver.csv');
        const areaLicenses = await readCSVFile('omradekode_antallloyver.csv');

        // Skip headers
        const totalData = totalLicenses.slice(1);
        const areaData = areaLicenses.slice(1);

        const stats: Record<string, LicenseStats> = {};

        // Process total licenses per transportor
        totalData.forEach(([avtaleKontor, transportor, total]) => {
            if (!stats[avtaleKontor]) {
                stats[avtaleKontor] = {
                    totalLicenses: 0,
                    transportorLicenses: {}
                };
            }

            const totalNum = parseInt(total) || 0;
            stats[avtaleKontor].totalLicenses += totalNum;
            stats[avtaleKontor].transportorLicenses[transportor] = {
                total: totalNum,
                areas: []
            };
        });

        // Process area distribution
        areaData.forEach(([avtaleKontor, transportor, code, name, count]) => {
            if (stats[avtaleKontor]?.transportorLicenses[transportor]) {
                stats[avtaleKontor].transportorLicenses[transportor].areas.push({
                    code,
                    name,
                    count: parseInt(count) || 0
                });
            }
        });

        return stats;
    } catch (error) {
        console.error('Error getting license stats:', error);
        return {};
    }
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
    const data = await getLatestJson();
    if (!data?.contracts) return null;

    const contracts = data.contracts;
    const licenseStats = await getLicenseStats();

    // Group contracts by AvtaleKontor
    const avtaleKontorStats = contracts.reduce((acc, contract) => {
        const kontor = contract.avtaleKontor || 'Unknown';
        
        if (!acc[kontor]) {
            acc[kontor] = {
                totalContracts: 0,
                transporters: new Set<string>(),
                cities: new Set<string>(),
                startKommune: new Set<string>(),
                totalResources: 0,
                averageCostPerKm: 0,
                totalCostPerKm: 0
            };
        }

        acc[kontor].totalContracts++;
        if (contract.avtaleNavn) acc[kontor].transporters.add(contract.avtaleNavn);
        if (contract.startLocation?.city) acc[kontor].cities.add(contract.startLocation.city);
        if (contract.startLocation?.municipality) acc[kontor].startKommune.add(contract.startLocation.municipality);
        acc[kontor].totalResources += contract.resourceCount || 0;
        acc[kontor].totalCostPerKm += contract.cost?.costPerKm || 0;

        return acc;
    }, {} as Record<string, {
        totalContracts: number;
        transporters: Set<string>;
        cities: Set<string>;
        startKommune: Set<string>;
        totalResources: number;
        averageCostPerKm: number;
        totalCostPerKm: number;
    }>);

    // Convert Sets to counts and calculate averages
    const processedAvtaleKontorStats = Object.entries(avtaleKontorStats).reduce((acc, [kontor, stats]) => {
        acc[kontor] = {
            totalContracts: stats.totalContracts,
            transporterCount: stats.transporters.size,
            cityCount: stats.cities.size,
            startKommuneCount: stats.startKommune.size,
            totalResources: stats.totalResources,
            averageCostPerKm: stats.totalContracts > 0 ? stats.totalCostPerKm / stats.totalContracts : 0
        };
        return acc;
    }, {} as Record<string, {
        totalContracts: number;
        transporterCount: number;
        cityCount: number;
        startKommuneCount: number;
        totalResources: number;
        averageCostPerKm: number;
    }>);

    return {
        totalContracts: contracts.length,
        contractTypes: contracts.reduce((acc, contract) => {
            const type = contract.type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        totalResources: contracts.reduce((sum, contract) => sum + (contract.resourceCount || 0), 0),
        averageCostPerKm: contracts.reduce((sum, contract) => sum + (contract.cost?.costPerKm || 0), 0) / contracts.length,
        averageMinimumCost: contracts.reduce((sum, contract) => sum + (contract.cost?.minimumCost || 0), 0) / contracts.length,
        validTransports: Array.from(new Set(contracts.map(c => c.validTransport))).filter(Boolean),
        validNeeds: Array.from(new Set(contracts.flatMap(c => c.validNeeds))).filter(Boolean),
        avtaleKontorStats: processedAvtaleKontorStats,
        licenseStats
    };
}

export async function reorderJson(order: string[]): Promise<void> {
    const data = await getLatestJson();
    if (!data?.contracts) return;

    // Helper function to reorder object fields
    const reorderObject = (obj: any, order: string[]): any => {
        const orderedObj: any = {};
        
        // First add ordered fields
        order.forEach(field => {
            if (obj.hasOwnProperty(field)) {
                orderedObj[field] = obj[field];
            }
        });
        
        // Then add any remaining fields
        Object.keys(obj).forEach(field => {
            if (!order.includes(field)) {
                orderedObj[field] = obj[field];
            }
        });
        
        return orderedObj;
    };

    // Reorder each contract
    const reorderedContracts = data.contracts.map(contract => reorderObject(contract, order));
    
    // Save the reordered JSON
    await saveLatestJson(JSON.stringify({ ...data, contracts: reorderedContracts }, null, 2));
} 