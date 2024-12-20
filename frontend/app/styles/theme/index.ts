import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius: {
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        full: '9999px',   // Full rounded
    },
    transitions: {
        fast: '100ms ease',
        default: '150ms ease',
        slow: '300ms ease',
    },
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    zIndex: {
        nav: '40',
        modal: '50',
        tooltip: '60',
    }
} as const;

export type Theme = typeof theme;
export * from './colors';
export * from './typography';
export * from './spacing'; 