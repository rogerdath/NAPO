'use client';

import { useEffect } from 'react';
import { Contract } from '@/types';
import { storeContracts, initDB } from '@/app/lib/db';
import { info, error } from '@/app/lib/client-logger';

interface ContractStorageProps {
    initialContracts: Contract[];
}

export function ContractStorage({ initialContracts }: ContractStorageProps) {
    useEffect(() => {
        const syncContracts = async () => {
            try {
                // Initialize IndexedDB
                await initDB();
                
                // Store the contracts from the server into IndexedDB
                await storeContracts(initialContracts);
                
                await info('ContractStorage', 'Contracts synced to IndexedDB', {
                    count: initialContracts.length
                });
            } catch (err) {
                await error('ContractStorage', 'Failed to sync contracts', err);
            }
        };

        if (initialContracts && initialContracts.length > 0) {
            syncContracts();
        }
    }, [initialContracts]);

    return null; // This is a non-visual component
} 