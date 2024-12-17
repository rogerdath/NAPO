'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Contract } from '@/types';

interface ContractDB extends DBSchema {
    'raw-data': {
        key: string;
        value: {
            id: string;
            content: string;
            filename: string;
            timestamp: number;
        };
    };
    'contracts': {
        key: string;
        value: Contract;
        indexes: {
            'by-avtalekontor': string;
            'by-type': string;
            'by-postal': string;
        };
    };
    'structures': {
        key: string;
        value: {
            id: string;
            name: string;
            structure: any;
            timestamp: number;
        };
    };
    'locations': {
        key: string;
        value: {
            id: string;
            contractId: string;
            coordinate: { øst: number; nord: number };
            timestamp: number;
        };
    };
}

let db: IDBPDatabase<ContractDB>;

export async function initDB() {
    db = await openDB<ContractDB>('contract-manager', 1, {
        upgrade(db) {
            // Store raw CSV data
            const rawStore = db.createObjectStore('raw-data', {
                keyPath: 'id'
            });
            rawStore.createIndex('by-filename', 'filename');

            // Store processed contracts
            const contractStore = db.createObjectStore('contracts', {
                keyPath: 'id'
            });
            contractStore.createIndex('by-avtalekontor', 'avtaleKontor');
            contractStore.createIndex('by-type', 'type');
            contractStore.createIndex('by-postal', 'startLocation.postalCode');

            // Store JSON structures
            db.createObjectStore('structures', {
                keyPath: 'id'
            });

            // Store location data
            db.createObjectStore('locations', {
                keyPath: 'id'
            });
        }
    });
}

// Raw data operations
export async function storeRawData(filename: string, content: string) {
    await initDB();
    return db.add('raw-data', {
        id: crypto.randomUUID(),
        filename,
        content,
        timestamp: Date.now()
    });
}

export async function getRawData(id: string) {
    await initDB();
    return db.get('raw-data', id);
}

export async function listRawData() {
    await initDB();
    return db.getAllFromIndex('raw-data', 'by-filename');
}

// Contract operations
export async function storeContract(contract: Contract) {
    await initDB();
    return db.put('contracts', contract);
}

export async function storeContracts(contracts: Contract[]) {
    await initDB();
    const tx = db.transaction('contracts', 'readwrite');
    await Promise.all([
        ...contracts.map(contract => tx.store.put(contract)),
        tx.done
    ]);
}

export async function getContract(id: string) {
    await initDB();
    return db.get('contracts', id);
}

export async function searchContracts(query: {
    avtaleKontor?: string;
    type?: string;
    postalCode?: string;
}) {
    await initDB();
    let contracts = await db.getAll('contracts');

    if (query.avtaleKontor) {
        contracts = contracts.filter(c => c.avtaleKontor === query.avtaleKontor);
    }
    if (query.type) {
        contracts = contracts.filter(c => c.type === query.type);
    }
    if (query.postalCode) {
        contracts = contracts.filter(c => 
            c.startLocation?.postalCode?.includes(query.postalCode || '')
        );
    }

    return contracts;
}

// Structure operations
export async function saveStructure(name: string, structure: any) {
    await initDB();
    return db.add('structures', {
        id: crypto.randomUUID(),
        name,
        structure,
        timestamp: Date.now()
    });
}

export async function getStructure(id: string) {
    await initDB();
    return db.get('structures', id);
}

export async function listStructures() {
    await initDB();
    return db.getAll('structures');
}

// Location operations
export async function saveLocation(contractId: string, coordinate: { øst: number; nord: number }) {
    await initDB();
    return db.add('locations', {
        id: crypto.randomUUID(),
        contractId,
        coordinate,
        timestamp: Date.now()
    });
}

export async function getLocation(contractId: string) {
    await initDB();
    const locations = await db.getAll('locations');
    return locations.find(l => l.contractId === contractId);
}

export async function updateLocation(id: string, coordinate: { øst: number; nord: number }) {
    await initDB();
    const location = await db.get('locations', id);
    if (location) {
        location.coordinate = coordinate;
        location.timestamp = Date.now();
        return db.put('locations', location);
    }
} 