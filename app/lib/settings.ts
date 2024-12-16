'use server';

import { promises as fs } from 'fs';
import path from 'path';

interface Settings {
    enableLogging: boolean;
    logRotationSizeMB: number;
    outputDirectory: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

const DEFAULT_SETTINGS: Settings = {
    enableLogging: true,
    logRotationSizeMB: 10,
    outputDirectory: 'output'
};

export async function getSettings(): Promise<Settings> {
    try {
        const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
    } catch {
        await saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
    const current = await getSettings();
    const newSettings = { ...current, ...settings };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
} 