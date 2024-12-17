"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { serverError, info, debug } from '@/app/lib/logger';

interface Contract {
    AvtaleKontor?: string;
    Type?: string;
    PostalCode?: string;
    [key: string]: any;
}

export async function loadContracts(): Promise<Contract[]> {
    try {
        const outputDir = path.join(process.cwd(), 'output');
        const files = await fs.readdir(outputDir);
        
        // Find the most recent JSON file
        const jsonFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('history.json'));
        if (jsonFiles.length === 0) {
            await info('ContractActions', 'No JSON files found in output directory');
            return [];
        }
        
        const fileStats = await Promise.all(
            jsonFiles.map(async file => ({
                name: file,
                time: (await fs.stat(path.join(outputDir, file))).mtime.getTime()
            }))
        );

        const mostRecentFile = fileStats.reduce((prev, curr) => 
            prev.time > curr.time ? prev : curr
        );

        await info('ContractActions', `Loading contracts from ${mostRecentFile.name}`);

        const content = await fs.readFile(
            path.join(outputDir, mostRecentFile.name),
            'utf8'
        );
        
        const data = JSON.parse(content);
        // Ensure we have an array of contracts
        const contracts = Array.isArray(data) ? data : [data];
        await info('ContractActions', `Loaded ${contracts.length} contracts from ${mostRecentFile.name}`);
        return contracts;
    } catch (error) {
        await serverError(error instanceof Error ? error : new Error('Unknown error in loadContracts'));
        throw error;
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
        if (!Array.isArray(contracts)) {
            const error = new Error('searchContracts received non-array contracts');
            await serverError(error);
            throw error;
        }

        await debug('ContractActions', 'Applying filters', {
            searchTerm,
            filters,
            totalContracts: contracts.length
        });

        const filtered = contracts.filter(contract => {
            const matchesSearch = !searchTerm || 
                Object.values(contract).some(value => 
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                );
                
            const matchesAvtaleKontor = !filters.avtaleKontor ||
                contract.AvtaleKontor?.toLowerCase() === filters.avtaleKontor.toLowerCase();
                
            const matchesType = !filters.type ||
                contract.Type?.toLowerCase() === filters.type.toLowerCase();
                
            const matchesPostalCode = !filters.postalCode ||
                contract.PostalCode?.includes(filters.postalCode);
                
            return matchesSearch && matchesAvtaleKontor && matchesType && matchesPostalCode;
        });

        await debug('ContractActions', 'Filters applied', {
            filteredCount: filtered.length,
            reduction: contracts.length - filtered.length
        });

        return filtered;
    } catch (error) {
        await serverError(error instanceof Error ? error : new Error('Unknown error in searchContracts'));
        throw error;
    }
}

export async function getContractStats() {
    try {
        const contracts = await loadContracts();
        if (!Array.isArray(contracts)) {
            const error = new Error('getContractStats received non-array contracts');
            await serverError(error);
            throw error;
        }
        
        const avtaleKontorer = Array.from(new Set(
            contracts
                .map(c => c.AvtaleKontor)
                .filter((k): k is string => k !== undefined)
        ));
        
        const types = Array.from(new Set(
            contracts
                .map(c => c.Type)
                .filter((t): t is string => t !== undefined)
        ));
        
        const stats = {
            total: contracts.length,
            avtaleKontorer,
            types,
            stats: {
                byAvtaleKontor: avtaleKontorer.map(kontor => ({
                    name: kontor,
                    count: contracts.filter(c => c.AvtaleKontor === kontor).length
                })),
                byType: types.map(type => ({
                    name: type,
                    count: contracts.filter(c => c.Type === type).length
                }))
            }
        };

        await info('ContractActions', 'Contract stats generated', stats);
        return stats;
    } catch (error) {
        await serverError(error instanceof Error ? error : new Error('Unknown error in getContractStats'));
        throw error;
    }
} 