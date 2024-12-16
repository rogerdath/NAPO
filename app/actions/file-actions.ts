"use server";

import { promises as fs } from 'fs';
import path from 'path';

export async function saveFile(fileName: string, content: string) {
    const outputDir = path.join(process.cwd(), 'output');
    
    try {
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(path.join(outputDir, fileName), content);
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
}

export async function readFile(fileName: string) {
    try {
        const filePath = path.join(process.cwd(), 'output', fileName);
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}

export async function deleteFile(fileName: string) {
    try {
        const filePath = path.join(process.cwd(), 'output', fileName);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

export async function loadHistory() {
    try {
        const historyPath = path.join(process.cwd(), 'output', 'export_history.json');
        const content = await fs.readFile(historyPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

export async function saveHistory(history: any[]) {
    const historyPath = path.join(process.cwd(), 'output', 'export_history.json');
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
} 