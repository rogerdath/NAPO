export const colors = {
    brand: {
        primary: '#003087',    // SINTEF Blue
        secondary: '#0067C5',  // Secondary Blue
        accent: '#CCF1FF',     // Light Blue
    },
    
    nav: {
        light: {
            background: '#003087',        // SINTEF Blue
            border: '#0067C5',           // Secondary Blue
            text: {
                default: '#A1A1AA',      // Muted text
                hover: '#F4F4F5',        // Light text
                active: '#FFFFFF',        // White
            },
            item: {
                activeBg: '#0067C5',     // Secondary Blue
                hoverBg: 'rgba(0, 103, 197, 0.1)',  // Secondary Blue with opacity
            }
        },
        dark: {
            background: '#18181B',        // Dark background
            border: '#27272A',           // Dark border
            text: {
                default: '#A1A1AA',      // Muted text
                hover: '#F4F4F5',        // Light text
                active: '#FFFFFF',        // White
            },
            item: {
                activeBg: '#0067C5',     // Secondary Blue
                hoverBg: 'rgba(0, 103, 197, 0.1)',  // Secondary Blue with opacity
            }
        }
    },

    state: {
        success: '#22C55E',     // Green
        error: '#EF4444',       // Red
        warning: '#F59E0B',     // Orange
        info: '#3B82F6',        // Blue
    },

    text: {
        primary: '#171717',     // Near black
        secondary: '#525252',   // Dark gray
        muted: '#737373',       // Medium gray
    },

    background: {
        main: '#FFFFFF',        // White
        card: '#FFFFFF',
        popup: '#FFFFFF',
    },

    dark: {
        background: '#18181B',  // Dark background
        text: '#F4F4F5',        // Light text
        card: '#27272A',        // Dark card
        border: '#3F3F46',      // Dark border
    }
} as const;

export type Colors = typeof colors; 