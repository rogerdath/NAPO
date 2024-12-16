'use server';

import { promises as fs } from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'transform.log');

export async function logToFile(message: string, data?: any) {
    try {
        // Ensure log directory exists
        await fs.mkdir(LOG_DIR, { recursive: true });

        // Format the log entry
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n${data ? JSON.stringify(data, null, 2) + '\n' : ''}`;

        // Append to log file
        await fs.appendFile(LOG_FILE, logEntry + '\n');
    } catch (error) {
        // If we can't write to the log file, fall back to console
        console.error('Error writing to log file:', error);
    }
}

export async function clearLogs() {
    try {
        await fs.writeFile(LOG_FILE, ''); // Clear the file
    } catch (error) {
        console.error('Error clearing log file:', error);
    }
}

export async function rotateLogs() {
    try {
        const stats = await fs.stat(LOG_FILE).catch(() => null);
        if (stats && stats.size > 10 * 1024 * 1024) { // Rotate if larger than 10MB
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(LOG_DIR, `transform-${timestamp}.log`);
            await fs.rename(LOG_FILE, backupFile);
        }
    } catch (error) {
        console.error('Error rotating log file:', error);
    }
} 