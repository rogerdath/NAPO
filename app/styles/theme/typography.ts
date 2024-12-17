import { scala, calibri } from '../../fonts';

export const typography = {
    fonts: {
        scala,
        calibri,
        variables: {
            scala: 'var(--font-scala)',
            calibri: 'var(--font-calibri)',
        }
    },
    sizes: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
    },
    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    }
} as const;

export type Typography = typeof typography; 