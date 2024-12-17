'use client';

import { useEffect } from 'react';
import { Contract } from '@/types';
import { storeContracts } from '@/app/lib/db';
import { info, error } from '@/app/lib/client-logger';

interface ContractStorageProps {
    initialContracts: Contract[];
}

export function ContractStorage({ initialContracts }: ContractStorageProps) {
    useEffect(() => {
        const syncContracts = async () => {
            try {
                // Store the contracts from the file system into IndexedDB
                await storeContracts(initialContracts);
                
                await info('ContractStorage', 'Contracts synced to IndexedDB', {
                    count: initialContracts.length
                });
            } catch (err) {
                await error('ContractStorage', 'Failed to sync contracts', err);
            }
        };

        if (initialContracts.length > 0) {
            syncContracts();
        }
    }, [initialContracts]);

    return null; // This is a non-visual component
} 