import { parse } from 'papaparse';
import { Contract } from '@/types';
import { error } from './logger';

export function processCSVData(csvContent: string): Contract[] {
    try {
        const { data, errors } = parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                // Clean up header names
                return header.trim().replace(/\r/g, '');
            }
        });

        if (errors.length > 0) {
            throw new Error(`CSV parsing errors: ${errors.map(e => e.message).join(', ')}`);
        }

        return data.map((row: any) => {
            const contract: Contract = {
                id: row.ID || crypto.randomUUID(),
                avtaleKontor: row.AVTALEKONTOR || '',
                avtaleNavn: row.AVTALENAVN || '',
                type: row.TYPE || '',
                validTransport: row.VALIDTRANSPORT || '',
                validNeeds: (row.VALIDNEEDS || '').split(',').map((n: string) => n.trim()).filter(Boolean),
                cost: {
                    costPerKm: parseFloat(row.COSTKM) || 0,
                    minimumCost: parseFloat(row.MINCOST) || 0,
                    startupCost: parseFloat(row.STARTUPCOST) || 0
                },
                startLocation: {
                    postalCode: row.POSTALCODE || '',
                    city: row.CITY || '',
                    municipality: row.MUNICIPALITY || ''
                }
            };

            // Add coordinate if available
            if (row.COORDINATE_OST && row.COORDINATE_NORD) {
                contract.coordinate = {
                    øst: parseFloat(row.COORDINATE_OST),
                    nord: parseFloat(row.COORDINATE_NORD)
                };
            }

            return contract;
        });
    } catch (err) {
        error('CSV Processing', 'Failed to process CSV data', err);
        throw err;
    }
} 