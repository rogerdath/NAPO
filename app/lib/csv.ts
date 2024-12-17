import { parse } from 'papaparse';
import { error } from './logger';

export function processCSVData(csvContent: string): any[] {
    try {
        const { data, errors } = parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                // Clean up header names and preserve original casing
                return header.trim().replace(/\r/g, '');
            }
        });

        if (errors.length > 0) {
            throw new Error(`CSV parsing errors: ${errors.map(e => e.message).join(', ')}`);
        }

        return data.map((row: any) => {
            // Keep original field names from CSV
            const processedRow: any = {};
            Object.entries(row).forEach(([key, value]) => {
                processedRow[key] = typeof value === 'string' ? value.trim() : value;
            });
            return processedRow;
        });
    } catch (err) {
        error('CSV Processing', 'Failed to process CSV data', err);
        throw err;
    }
} 