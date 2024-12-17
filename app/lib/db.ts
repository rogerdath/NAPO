'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Contract, Area, ContractType, Resource, Location, ContractContent, Relation, DataFile } from '@/types';

interface ContractDB extends DBSchema {
    'areas': {
        key: string;
        value: Area;
        indexes: {
            'by-omradekode': string;
            'by-avtalekontor': string;
        };
    };
    'contract-types': {
        key: string;
        value: ContractType;
        indexes: {
            'by-omradekode': string;
        };
    };
    'resources': {
        key: string;
        value: Resource;
        indexes: {
            'by-omradekode': string;
            'by-avtalekontor': string;
        };
    };
    'locations': {
        key: string;
        value: Location;
        indexes: {
            'by-omradekode': string;
        };
    };
    'contract-contents': {
        key: string;
        value: ContractContent;
        indexes: {
            'by-omradekode': string;
        };
    };
    'relations': {
        key: string;
        value: Relation;
        indexes: {
            'by-source': [string, string];
            'by-target': [string, string];
        };
    };
    'data-files': {
        key: string;
        value: DataFile;
        indexes: {
            'by-type': string;
            'by-filename': string;
        };
    };
    'contracts': {
        key: string;
        value: Contract;
        indexes: {
            'by-avtalekontor': string;
            'by-type': string;
            'by-postalcode': string;
        };
    };
}

let db: IDBPDatabase<ContractDB>;
let dbInitPromise: Promise<void> | null = null;

export async function initDB() {
    if (dbInitPromise) return dbInitPromise;

    dbInitPromise = (async () => {
        try {
            db = await openDB<ContractDB>('contract-manager', 2, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    // Only delete stores if upgrading from version 1
                    if (oldVersion < 2) {
                        const storeNames = db.objectStoreNames;
                        for (const storeName of storeNames) {
                            db.deleteObjectStore(storeName);
                        }

                        console.log('Creating stores...');

                        // Areas store
                        const areaStore = db.createObjectStore('areas', {
                            keyPath: 'id'
                        });
                        areaStore.createIndex('by-omradekode', 'omradeKode');
                        areaStore.createIndex('by-avtalekontor', 'avtaleKontor');

                        // Contract types store
                        const typeStore = db.createObjectStore('contract-types', {
                            keyPath: 'id'
                        });
                        typeStore.createIndex('by-omradekode', 'omradeKode');

                        // Resources store
                        const resourceStore = db.createObjectStore('resources', {
                            keyPath: 'id'
                        });
                        resourceStore.createIndex('by-omradekode', 'avtaleOmradeKode');
                        resourceStore.createIndex('by-avtalekontor', 'avtaleKontor');

                        // Locations store
                        const locationStore = db.createObjectStore('locations', {
                            keyPath: 'id'
                        });
                        locationStore.createIndex('by-omradekode', 'omradeKode');

                        // Contract contents store
                        const contentStore = db.createObjectStore('contract-contents', {
                            keyPath: 'id'
                        });
                        contentStore.createIndex('by-omradekode', 'omradeKode');

                        // Relations store
                        const relationStore = db.createObjectStore('relations', {
                            keyPath: 'id'
                        });
                        relationStore.createIndex('by-source', ['sourceType', 'sourceId']);
                        relationStore.createIndex('by-target', ['targetType', 'targetId']);

                        // Data files store
                        const fileStore = db.createObjectStore('data-files', {
                            keyPath: 'id'
                        });
                        fileStore.createIndex('by-type', 'type');
                        fileStore.createIndex('by-filename', 'filename');

                        // Contracts store
                        const contractStore = db.createObjectStore('contracts', {
                            keyPath: 'id'
                        });
                        contractStore.createIndex('by-avtalekontor', 'avtaleKontor');
                        contractStore.createIndex('by-type', 'type');
                        contractStore.createIndex('by-postalcode', 'startLocation.postalCode');

                        console.log('Stores created successfully');
                    }
                },
                blocked() {
                    console.log('Database blocked - please close other tabs with this app');
                },
                blocking() {
                    console.log('Database blocking - please reload this page');
                    window.location.reload();
                },
                terminated() {
                    console.log('Database terminated - please reload this page');
                    window.location.reload();
                }
            });

            // Verify stores were created
            const storeNames = Array.from(db.objectStoreNames);
            console.log('Available stores:', storeNames);

            if (!storeNames.includes('areas') || 
                !storeNames.includes('contract-types') || 
                !storeNames.includes('resources') || 
                !storeNames.includes('locations') || 
                !storeNames.includes('contract-contents') || 
                !storeNames.includes('relations') || 
                !storeNames.includes('data-files') || 
                !storeNames.includes('contracts')) {
                throw new Error('Failed to create all required stores');
            }
        } catch (err) {
            console.error('Failed to initialize database:', err);
            dbInitPromise = null;
            throw err;
        }
    })();

    return dbInitPromise;
}

// Area operations
export async function storeArea(area: Area) {
    await initDB();
    return db.put('areas', area);
}

export async function storeAreas(areas: Area[]) {
    await initDB();
    const tx = db.transaction('areas', 'readwrite');
    await Promise.all([
        ...areas.map(area => tx.store.put(area)),
        tx.done
    ]);
}

export async function getAreaByOmradeKode(omradeKode: string) {
    await initDB();
    return db.getFromIndex('areas', 'by-omradekode', omradeKode);
}

// Contract type operations
export async function storeContractType(type: ContractType) {
    await initDB();
    return db.put('contract-types', type);
}

export async function storeContractTypes(types: ContractType[]) {
    await initDB();
    const tx = db.transaction('contract-types', 'readwrite');
    await Promise.all([
        ...types.map(type => tx.store.put(type)),
        tx.done
    ]);
}

export async function getContractTypeByOmradeKode(omradeKode: string) {
    await initDB();
    return db.getFromIndex('contract-types', 'by-omradekode', omradeKode);
}

// Resource operations
export async function storeResource(resource: Resource) {
    await initDB();
    return db.put('resources', resource);
}

export async function storeResources(resources: Resource[]) {
    await initDB();
    const tx = db.transaction('resources', 'readwrite');
    await Promise.all([
        ...resources.map(resource => tx.store.put(resource)),
        tx.done
    ]);
}

export async function getResourcesByOmradeKode(omradeKode: string) {
    await initDB();
    return db.getAllFromIndex('resources', 'by-omradekode', omradeKode);
}

// Location operations
export async function storeLocation(location: Location) {
    await initDB();
    return db.put('locations', location);
}

export async function storeLocations(locations: Location[]) {
    await initDB();
    const tx = db.transaction('locations', 'readwrite');
    await Promise.all([
        ...locations.map(location => tx.store.put(location)),
        tx.done
    ]);
}

export async function getLocationByOmradeKode(omradeKode: string) {
    await initDB();
    return db.getFromIndex('locations', 'by-omradekode', omradeKode);
}

// Contract content operations
export async function storeContractContent(content: ContractContent) {
    await initDB();
    return db.put('contract-contents', content);
}

export async function storeContractContents(contents: ContractContent[]) {
    await initDB();
    const tx = db.transaction('contract-contents', 'readwrite');
    await Promise.all([
        ...contents.map(content => tx.store.put(content)),
        tx.done
    ]);
}

export async function getContractContentByOmradeKode(omradeKode: string) {
    await initDB();
    return db.getFromIndex('contract-contents', 'by-omradekode', omradeKode);
}

// Relation operations
export async function storeRelation(relation: Relation) {
    await initDB();
    return db.put('relations', relation);
}

export async function storeRelations(relations: Relation[]) {
    await initDB();
    const tx = db.transaction('relations', 'readwrite');
    await Promise.all([
        ...relations.map(relation => tx.store.put(relation)),
        tx.done
    ]);
}

export async function getRelationsBySource(sourceType: string, sourceId: string) {
    await initDB();
    return db.getAllFromIndex('relations', 'by-source', [sourceType, sourceId]);
}

export async function getRelationsByTarget(targetType: string, targetId: string) {
    await initDB();
    return db.getAllFromIndex('relations', 'by-target', [targetType, targetId]);
}

// Data file operations
export async function storeDataFile(file: DataFile) {
    await initDB();
    return db.put('data-files', file);
}

export async function getDataFilesByType(type: string) {
    await initDB();
    return db.getAllFromIndex('data-files', 'by-type', type);
}

export async function clearDatabase() {
    await initDB();
    const tx = db.transaction(
        [
            'areas',
            'contract-types',
            'resources',
            'locations',
            'contract-contents',
            'relations',
            'data-files',
            'contracts'
        ],
        'readwrite'
    );

    await Promise.all([
        tx.objectStore('areas').clear(),
        tx.objectStore('contract-types').clear(),
        tx.objectStore('resources').clear(),
        tx.objectStore('locations').clear(),
        tx.objectStore('contract-contents').clear(),
        tx.objectStore('relations').clear(),
        tx.objectStore('data-files').clear(),
        tx.objectStore('contracts').clear(),
        tx.done
    ]);

    await info('Database', 'All data cleared successfully');
}

export async function getDatabaseInfo() {
    await initDB();
    const areaCount = (await db.getAll('areas')).length;
    const typeCount = (await db.getAll('contract-types')).length;
    const resourceCount = (await db.getAll('resources')).length;
    const locationCount = (await db.getAll('locations')).length;
    const contentCount = (await db.getAll('contract-contents')).length;
    const relationCount = (await db.getAll('relations')).length;
    const fileCount = (await db.getAll('data-files')).length;

    return {
        areaCount,
        typeCount,
        resourceCount,
        locationCount,
        contentCount,
        relationCount,
        fileCount,
        databaseName: db.name,
        version: db.version,
        objectStores: db.objectStoreNames,
    };
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