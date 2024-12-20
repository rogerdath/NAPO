"use server";

import { Contract } from '@/types';
import { error, info } from '@/app/lib/logger';
import { processCSVData } from '@/app/lib/csv';
import { promises as fs } from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

export async function loadContracts(): Promise<Contract[]> {
    try {
        // Read and process CSV files
        const csvFiles = {
            avtaleinnhold: await fs.readFile(path.join(process.cwd(), 'uploads', 'avtaleinnhold.csv'), 'utf8'),
            omrade: await fs.readFile(path.join(process.cwd(), 'uploads', 'omrade.csv'), 'utf8'),
            startsted: await fs.readFile(path.join(process.cwd(), 'uploads', 'startsted.csv'), 'utf8')
        };

        // Process the main contract data
        const contracts = processCSVData(csvFiles.avtaleinnhold).map(row => ({
            id: row.OMRADEKODE,
            avtaleKontor: row.AVTALEKONTOR,
            avtaleNavn: row.AVTALENAVN,
            type: row.TYPE,
            validTransport: row.GYLDIGTRANSPORT,
            validNeeds: row.GYLDIGBEHOV ? row.GYLDIGBEHOV.split(';').map((n: string) => n.trim()) : [],
            cost: {
                costPerKm: parseFloat(row.KMPRIS) || 0,
                minimumCost: parseFloat(row.MINPRIS) || 0,
                startupCost: parseFloat(row.STARTTAKST) || 0
            }
        }));

        // Enrich with area data
        const areaData = processCSVData(csvFiles.omrade);
        const startData = processCSVData(csvFiles.startsted);

        // Merge data
        const enrichedContracts = contracts.map(contract => {
            const areaInfo = areaData.find(a => a.OMRADEKODE === contract.id);
            const startInfo = startData.find(s => s.OMRADEKODE === contract.id);

            return {
                ...contract,
                startLocation: {
                    postalCode: startInfo?.STARTPOSTNR || '',
                    city: startInfo?.STARTPOSTSTED || '',
                    municipality: startInfo?.KOMMUNE || areaInfo?.KOMMUNE || ''
                }
            };
        });
        
        await info('ContractActions', 'Contracts processed', {
            count: enrichedContracts.length
        });

        return enrichedContracts;
    } catch (err) {
        await error('ContractActions', 'Failed to load contracts', err);
        throw err;
    }
}

export async function searchContracts(
    contracts: Contract[],
    searchTerm: string,
    filters: {
        avtaleKontor?: string;
        type?: string;
        postalCode?: string;
    }
): Promise<Contract[]> {
    try {
        let filtered = [...contracts];

        // Apply filters
        if (filters.avtaleKontor) {
            filtered = filtered.filter(c => c.avtaleKontor === filters.avtaleKontor);
        }
        if (filters.type) {
            filtered = filtered.filter(c => c.type === filters.type);
        }
        if (filters.postalCode) {
            filtered = filtered.filter(c => 
                c.startLocation?.postalCode?.includes(filters.postalCode || '')
            );
        }

        // Apply search term
        if (searchTerm) {
            filtered = filtered.filter(contract => 
                Object.values(contract).some(value => 
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        return filtered;
    } catch (err) {
        await error('ContractActions', 'Failed to search contracts', err);
        throw err;
    }
}

export async function getContractStats(): Promise<{
    avtaleKontorer: string[];
    types: string[];
}> {
    try {
        const contracts = await loadContracts();
        
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

        return {
            avtaleKontorer,
            types
        };
    } catch (err) {
        await error('ContractActions', 'Failed to get contract stats', err);
        throw err;
    }
}

export async function saveContracts(contracts: Contract[]): Promise<void> {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `contracts_${timestamp}.json`;
        const filePath = path.join(OUTPUT_DIR, fileName);

        await fs.writeFile(filePath, JSON.stringify(contracts, null, 2));

        await info('ContractActions', 'Contracts saved', {
            fileName,
            count: contracts.length
        });
    } catch (err) {
        await error('ContractActions', 'Failed to save contracts', err);
        throw err;
    }
} 