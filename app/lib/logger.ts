'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { headers } from 'next/headers';

const LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG = 'error.log';
const INFO_LOG = 'info.log';
const DEBUG_LOG = 'debug.log';
const STRUCTURED_ERRORS = 'structured-errors.json';

// Maximum file size before rotation (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum number of backup files
const MAX_BACKUPS = 5;

interface LogEntry {
    timestamp: string;
    level: 'error' | 'info' | 'debug';
    component: string;
    message: string;
    details?: any;
    url?: string;
    method?: string;
}

interface ErrorLogEntry extends LogEntry {
    level: 'error';
    stack?: string;
    statusCode?: number;
}

async function ensureLogDir() {
    try {
        await fs.access(LOG_DIR);
    } catch {
        await fs.mkdir(LOG_DIR, { recursive: true });
    }
}

async function rotateLogFile(logFile: string) {
    const logPath = path.join(LOG_DIR, logFile);
    try {
        const stats = await fs.stat(logPath);
        if (stats.size > MAX_FILE_SIZE) {
            // Rotate backup files
            for (let i = MAX_BACKUPS - 1; i >= 0; i--) {
                const oldPath = path.join(LOG_DIR, `${logFile}.${i}`);
                const newPath = path.join(LOG_DIR, `${logFile}.${i + 1}`);
                try {
                    await fs.access(oldPath);
                    await fs.rename(oldPath, newPath);
                } catch {
                    // File doesn't exist, skip
                }
            }
            // Rename current log file to .0
            await fs.rename(logPath, path.join(LOG_DIR, `${logFile}.0`));
        }
    } catch {
        // File doesn't exist yet
    }
}

async function logToFile(logFile: string, entry: LogEntry | ErrorLogEntry) {
    await ensureLogDir();
    await rotateLogFile(logFile);

    const logPath = path.join(LOG_DIR, logFile);
    const logLine = JSON.stringify(entry) + '\n';

    await fs.appendFile(logPath, logLine, 'utf8');
}

async function getRequestInfo() {
    try {
        const headersList = await headers();
        const url = headersList.get('x-url');
        const method = headersList.get('x-method');
        return {
            url: url || '',
            method: method || ''
        };
    } catch {
        return { url: '', method: '' };
    }
}

export async function error(component: string, message: string, error?: Error | unknown) {
    const { url, method } = await getRequestInfo();
    
    const entry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        component,
        message,
        details: error,
        stack: error instanceof Error ? error.stack : undefined,
        url,
        method,
        statusCode: error instanceof Error ? (error as any).statusCode || 500 : 500
    };

    await logToFile(ERROR_LOG, entry);

    // Also store in structured errors
    try {
        const structuredPath = path.join(LOG_DIR, STRUCTURED_ERRORS);
        let errors: ErrorLogEntry[] = [];
        try {
            const content = await fs.readFile(structuredPath, 'utf8');
            errors = JSON.parse(content);
        } catch {
            // File doesn't exist or is invalid
        }

        errors.unshift(entry);
        errors = errors.slice(0, 1000); // Keep last 1000 errors
        await fs.writeFile(structuredPath, JSON.stringify(errors, null, 2));
    } catch {
        // Failed to write structured errors
    }
}

export async function info(component: string, message: string, details?: any) {
    const { url, method } = await getRequestInfo();
    
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        component,
        message,
        details,
        url,
        method
    };

    await logToFile(INFO_LOG, entry);
}

export async function debug(component: string, message: string, details?: any) {
    const { url, method } = await getRequestInfo();
    
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        component,
        message,
        details,
        url,
        method
    };

    await logToFile(DEBUG_LOG, entry);
}

export async function clearLogs() {
    await ensureLogDir();
    const logFiles = [ERROR_LOG, INFO_LOG, DEBUG_LOG];
    
    for (const file of logFiles) {
        const logPath = path.join(LOG_DIR, file);
        try {
            await fs.writeFile(logPath, '');
        } catch {
            // File doesn't exist
        }
    }
}