import { NextRequest, NextResponse } from 'next/server';
import { error as logError, info as logInfo, debug as logDebug } from '@/app/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { level, component, message, details } = body;

        // Add request headers for server logging
        request.headers.set('x-url', request.url);
        request.headers.set('x-method', request.method);

        switch (level) {
            case 'error':
                await logError(component, message, details);
                break;
            case 'info':
                await logInfo(component, message, details);
                break;
            case 'debug':
                await logDebug(component, message, details);
                break;
            default:
                return NextResponse.json({ error: 'Invalid log level' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error in log API:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 