"use server";

import { logger } from "@/app/lib/logger";

export async function getRecentLogs(type: 'error' | 'info' | 'debug' = 'error', lines: number = 100) {
    return await logger.readLogs(type, lines);
}

export async function clearAllLogs() {
    await logger.clearLogs();
    return { success: true };
} 