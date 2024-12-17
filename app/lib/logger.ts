'use server';

import { promises as fs } from 'fs';
import path from 'path';

interface ErrorLog {
    timestamp: string;
    type: 'error' | 'info' | 'debug';
    component: string;
    message: string;
    details?: any;
    stack?: string;
    url?: string;
    method?: string;
    statusCode?: number;
}

const LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG_PATH = path.join(LOG_DIR, 'error.log');
const INFO_LOG_PATH = path.join(LOG_DIR, 'info.log');
const DEBUG_LOG_PATH = path.join(LOG_DIR, 'debug.log');
const STRUCTURED_ERROR_PATH = path.join(LOG_DIR, 'structured-errors.json');

async function initLogDir() {
    try {
        await fs.mkdir(LOG_DIR, { recursive: true });
        // Initialize structured error log if it doesn't exist
        try {
            await fs.access(STRUCTURED_ERROR_PATH);
        } catch {
            await fs.writeFile(STRUCTURED_ERROR_PATH, '[]');
        }
    } catch (error) {
        console.error('Failed to create logs directory:', error);
    }
}

async function writeLog(filePath: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    
    try {
        await fs.appendFile(filePath, logEntry);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

async function writeStructuredError(errorLog: ErrorLog) {
    try {
        let errors: ErrorLog[] = [];
        try {
            const content = await fs.readFile(STRUCTURED_ERROR_PATH, 'utf8');
            errors = JSON.parse(content);
        } catch {
            errors = [];
        }

        errors.push(errorLog);

        // Keep only the last 1000 errors
        if (errors.length > 1000) {
            errors = errors.slice(-1000);
        }

        await fs.writeFile(STRUCTURED_ERROR_PATH, JSON.stringify(errors, null, 2));
    } catch (error) {
        console.error('Failed to write structured error:', error);
    }
}

// Initialize log directory
initLogDir();

export async function error(component: string, message: string, error?: any, request?: Request) {
    const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'error',
        component,
        message,
        details: error,
        stack: error?.stack,
        url: request?.url,
        method: request?.method,
        statusCode: error?.statusCode || 500
    };

    await Promise.all([
        writeLog(ERROR_LOG_PATH, `ERROR [${component}]: ${message}`, {
            ...error,
            url: request?.url,
            method: request?.method
        }),
        writeStructuredError(errorLog)
    ]);
}

export async function serverError(error: Error & { digest?: string }, request?: Request) {
    const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'error',
        component: 'Server',
        message: error.message,
        details: {
            name: error.name,
            digest: error.digest
        },
        stack: error.stack,
        url: request?.url,
        method: request?.method,
        statusCode: 500
    };

    await Promise.all([
        writeLog(ERROR_LOG_PATH, `SERVER ERROR: ${error.message}`, {
            name: error.name,
            digest: error.digest,
            stack: error.stack,
            url: request?.url,
            method: request?.method
        }),
        writeStructuredError(errorLog)
    ]);
}

export async function info(component: string, message: string, data?: any) {
    const infoLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'info',
        component,
        message,
        details: data
    };

    await Promise.all([
        writeLog(INFO_LOG_PATH, `INFO [${component}]: ${message}`, data),
        writeStructuredError(infoLog)
    ]);
}

export async function debug(component: string, message: string, data?: any) {
    const debugLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        type: 'debug',
        component,
        message,
        details: data
    };

    await Promise.all([
        writeLog(DEBUG_LOG_PATH, `DEBUG [${component}]: ${message}`, data),
        writeStructuredError(debugLog)
    ]);
}

export async function readLogs(type: 'error' | 'info' | 'debug', lines: number = 100): Promise<string[]> {
    const logPath = {
        error: ERROR_LOG_PATH,
        info: INFO_LOG_PATH,
        debug: DEBUG_LOG_PATH
    }[type];

    try {
        const content = await fs.readFile(logPath, 'utf8');
        return content.split('\n')
            .filter(line => line.trim())
            .slice(-lines);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

export async function getStructuredErrors(
    options: {
        type?: 'error' | 'info' | 'debug';
        component?: string;
        limit?: number;
        startTime?: Date;
        endTime?: Date;
    } = {}
): Promise<ErrorLog[]> {
    try {
        const content = await fs.readFile(STRUCTURED_ERROR_PATH, 'utf8');
        let errors: ErrorLog[] = JSON.parse(content);

        // Apply filters
        if (options.type) {
            errors = errors.filter(e => e.type === options.type);
        }
        if (options.component) {
            errors = errors.filter(e => e.component === options.component);
        }
        if (options.startTime) {
            errors = errors.filter(e => new Date(e.timestamp) >= options.startTime!);
        }
        if (options.endTime) {
            errors = errors.filter(e => new Date(e.timestamp) <= options.endTime!);
        }

        // Apply limit
        if (options.limit) {
            errors = errors.slice(-options.limit);
        }

        return errors;
    } catch (error) {
        console.error('Failed to read structured errors:', error);
        return [];
    }
}

export async function clearLogs() {
    try {
        await Promise.all([
            fs.writeFile(ERROR_LOG_PATH, ''),
            fs.writeFile(INFO_LOG_PATH, ''),
            fs.writeFile(DEBUG_LOG_PATH, ''),
            fs.writeFile(STRUCTURED_ERROR_PATH, '[]')
        ]);
    } catch (error) {
        console.error('Failed to clear logs:', error);
    }
}