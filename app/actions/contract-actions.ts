"use server";

import { Contract } from '@/types';
import { error, info } from '@/app/lib/logger';
import { processCSVData } from '@/app/lib/csv';
import { promises as fs } from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'output');

export async function loadContracts(): Promise<Contract[]> {
    try {
        // Ensure output directory exists
        try {
            await fs.access(OUTPUT_DIR);
        } catch {
            await fs.mkdir(OUTPUT_DIR, { recursive: true });
        }

        // Find the most recent JSON file
        const files = await fs.readdir(OUTPUT_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            return [];
        }

        const fileStats = await Promise.all(
            jsonFiles.map(async file => ({
                name: file,
                time: (await fs.stat(path.join(OUTPUT_DIR, file))).mtime.getTime()
            }))
        );

        const mostRecentFile = fileStats.reduce((prev, curr) => 
            prev.time > curr.time ? prev : curr
        );

        const content = await fs.readFile(
            path.join(OUTPUT_DIR, mostRecentFile.name),
            'utf8'
        );

        const contracts = JSON.parse(content);
        
        await info('ContractActions', 'Contracts loaded', {
            count: contracts.length
        });

        return contracts;
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