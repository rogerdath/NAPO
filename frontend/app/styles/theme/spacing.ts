export const spacing = {
    nav: {
        width: '16rem',      // 256px - Navigation width
        height: '3.5rem',    // 56px - Navigation header height
        padding: '1rem',     // 16px - Internal padding
    },
    container: {
        padding: '2rem',     // 32px - Container padding
        maxWidth: '1400px',  // Max container width
    },
    layout: {
        gap: '2rem',         // 32px - Default gap between sections
        padding: {
            sm: '1rem',      // 16px
            md: '2rem',      // 32px
            lg: '4rem',      // 64px
        }
    }
} as const;

export type Spacing = typeof spacing; 