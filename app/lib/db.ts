'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Contract, TransformedData } from '@/app/actions/dashboard-actions';

interface CSVFile {
    name: string;
    content: string[][];
    timestamp: number;
}

interface UserPreferences {
    fieldOrder: string[];
    filters: Record<string, string>;
    lastView: string;
}

interface JSONData {
    data: TransformedData;
    timestamp: number;
}

interface AppDBSchema extends DBSchema {
    jsonData: {
        key: string;
        value: JSONData;
        indexes: { 'by-timestamp': number };
    };
    csvFiles: {
        key: string;
        value: CSVFile;
        indexes: { 'by-timestamp': number };
    };
    userPreferences: {
        key: string;
        value: UserPreferences;
    };
}

const DB_NAME = 'avtaleportal-db';
const DB_VERSION = 1;

class DatabaseService {
    private db: Promise<IDBPDatabase<AppDBSchema>>;

    constructor() {
        this.db = this.initDB();
    }

    private async initDB() {
        return openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                // Create stores if they don't exist
                if (!db.objectStoreNames.contains('jsonData')) {
                    const jsonStore = db.createObjectStore('jsonData');
                    jsonStore.createIndex('by-timestamp', 'timestamp');
                }
                if (!db.objectStoreNames.contains('csvFiles')) {
                    const csvStore = db.createObjectStore('csvFiles');
                    csvStore.createIndex('by-timestamp', 'timestamp');
                }
                if (!db.objectStoreNames.contains('userPreferences')) {
                    db.createObjectStore('userPreferences');
                }
            },
            blocked() {
                console.warn('Database upgrade was blocked');
            },
            blocking() {
                console.warn('Database is blocking an upgrade');
            },
            terminated() {
                console.error('Database connection was terminated');
            }
        });
    }

    // JSON Data operations
    async saveJSON(key: string, data: TransformedData): Promise<void> {
        try {
            const db = await this.db;
            const jsonData: JSONData = {
                data,
                timestamp: Date.now(),
            };
            await db.put('jsonData', jsonData, key);
        } catch (error) {
            console.error('Error saving JSON data:', error);
            throw new Error('Failed to save JSON data');
        }
    }

    async getJSON(key: string): Promise<JSONData | undefined> {
        try {
            const db = await this.db;
            return await db.get('jsonData', key);
        } catch (error) {
            console.error('Error getting JSON data:', error);
            return undefined;
        }
    }

    // CSV File operations
    async saveCSVFile(name: string, content: string[][]): Promise<void> {
        try {
            const db = await this.db;
            const csvFile: CSVFile = {
                name,
                content,
                timestamp: Date.now(),
            };
            await db.put('csvFiles', csvFile, name);
        } catch (error) {
            console.error('Error saving CSV file:', error);
            throw new Error('Failed to save CSV file');
        }
    }

    async getCSVFile(name: string): Promise<CSVFile | undefined> {
        try {
            const db = await this.db;
            return await db.get('csvFiles', name);
        } catch (error) {
            console.error('Error getting CSV file:', error);
            return undefined;
        }
    }

    async getAllCSVFiles(): Promise<CSVFile[]> {
        try {
            const db = await this.db;
            return await db.getAll('csvFiles');
        } catch (error) {
            console.error('Error getting all CSV files:', error);
            return [];
        }
    }

    // User Preferences operations
    async savePreferences(key: string, preferences: Partial<UserPreferences>): Promise<void> {
        try {
            const db = await this.db;
            const existing = await db.get('userPreferences', key) || {
                fieldOrder: [],
                filters: {},
                lastView: '',
            };
            const updatedPreferences: UserPreferences = {
                ...existing,
                ...preferences,
            };
            await db.put('userPreferences', updatedPreferences, key);
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw new Error('Failed to save preferences');
        }
    }

    async getPreferences(key: string): Promise<UserPreferences | undefined> {
        try {
            const db = await this.db;
            return await db.get('userPreferences', key);
        } catch (error) {
            console.error('Error getting preferences:', error);
            return undefined;
        }
    }

    // Cache management
    async clearCache(): Promise<void> {
        try {
            const db = await this.db;
            await Promise.all([
                db.clear('jsonData'),
                db.clear('csvFiles'),
            ]);
        } catch (error) {
            console.error('Error clearing cache:', error);
            throw new Error('Failed to clear cache');
        }
    }

    async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        try {
            const db = await this.db;
            const now = Date.now();

            // Use indexes for better performance
            const jsonTx = db.transaction('jsonData', 'readwrite');
            const jsonIndex = jsonTx.store.index('by-timestamp');
            const jsonCursor = await jsonIndex.openCursor();

            while (jsonCursor) {
                if (now - jsonCursor.value.timestamp > maxAge) {
                    await jsonCursor.delete();
                }
                await jsonCursor.continue();
            }

            const csvTx = db.transaction('csvFiles', 'readwrite');
            const csvIndex = csvTx.store.index('by-timestamp');
            const csvCursor = await csvIndex.openCursor();

            while (csvCursor) {
                if (now - csvCursor.value.timestamp > maxAge) {
                    await csvCursor.delete();
                }
                await csvCursor.continue();
            }
        } catch (error) {
            console.error('Error clearing old cache:', error);
            throw new Error('Failed to clear old cache');
        }
    }

    // Helper methods
    private validateCSVContent(content: string[][]): boolean {
        return Array.isArray(content) && content.every(row => 
            Array.isArray(row) && row.every(cell => typeof cell === 'string')
        );
    }

    private validateJSONData(data: unknown): data is TransformedData {
        if (!data || typeof data !== 'object') return false;
        const d = data as TransformedData;
        return Array.isArray(d.contracts) && d.contracts.every(contract => 
            typeof contract.id === 'string' &&
            typeof contract.avtaleKontor === 'string' &&
            typeof contract.avtaleNavn === 'string'
        );
    }
}

// Export a singleton instance
export const db = new DatabaseService(); 