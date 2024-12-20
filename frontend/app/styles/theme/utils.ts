import { theme } from './index';

type ThemeValue<T> = T extends object
    ? { [K in keyof T]: ThemeValue<T[K]> }
    : string;

type ThemePath = string[];

function getThemeValue(obj: any, path: ThemePath): string | undefined {
    return path.reduce((acc, key) => acc?.[key], obj);
}

// Convert hex to RGB
function hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r} ${g} ${b}`;
}

// Check if value is hex color
function isHexColor(value: string): boolean {
    return /^#?[0-9A-Fa-f]{6}$/.test(value);
}

// Format color value based on type
function formatColor(value: string, alpha?: number): string {
    if (isHexColor(value)) {
        const rgb = hexToRgb(value);
        return alpha !== undefined ? `rgba(${rgb}, ${alpha})` : `rgb(${rgb})`;
    }
    
    // Handle HSL values
    if (value.includes('%')) {
        return `hsl(${value})`;
    }
    
    // Handle RGB values
    return alpha !== undefined ? `rgba(${value}, ${alpha})` : `rgb(${value})`;
}

export function tv(path: string): string {
    const parts = path.split('.');
    const value = getThemeValue(theme, parts);
    
    if (!value) {
        console.warn(`Theme value not found for path: ${path}`);
        return '';
    }
    
    return value;
}

// CSS variable generator
export function cssVar(path: string): string {
    const parts = path.split('.');
    const value = getThemeValue(theme, parts);
    
    if (!value) {
        console.warn(`Theme value not found for path: ${path}`);
        return '';
    }
    
    // Convert theme path to CSS variable name
    const varName = parts.join('-');
    return `var(--${varName})`;
}

// Color helper with alpha support
export function color(path: string, alpha?: number): string {
    const value = getThemeValue(theme.colors, path.split('.'));
    
    if (!value) {
        console.warn(`Color not found for path: ${path}`);
        return '';
    }
    
    return formatColor(value, alpha);
}

// HSL color helper (maintained for backward compatibility)
export function hsl(path: string): string {
    const value = getThemeValue(theme.colors, path.split('.'));
    
    if (!value) {
        console.warn(`Color not found for path: ${path}`);
        return '';
    }
    
    return `hsl(${value})`;
} 