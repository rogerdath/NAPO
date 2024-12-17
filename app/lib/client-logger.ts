'use client';

interface LogEntry {
    component: string;
    message: string;
    details?: any;
}

async function logToServer(level: 'error' | 'info' | 'debug', entry: LogEntry) {
    try {
        const response = await fetch('/api/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-url': window.location.href,
                'x-method': 'CLIENT'
            },
            body: JSON.stringify({
                level,
                ...entry
            })
        });

        if (!response.ok) {
            console.error('Failed to log to server:', await response.text());
        }
    } catch (err) {
        console.error('Failed to send log to server:', err);
    }
}

export async function error(component: string, message: string, error?: Error | unknown) {
    const entry: LogEntry = {
        component,
        message,
        details: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause
        } : error
    };

    await logToServer('error', entry);
}

export async function info(component: string, message: string, details?: any) {
    await logToServer('info', { component, message, details });
}

export async function debug(component: string, message: string, details?: any) {
    await logToServer('debug', { component, message, details });
} 