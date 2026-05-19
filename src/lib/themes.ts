export type Theme = {
    bg: string;
    text: string;
    accent: string;
    card: string;
    muted: string;
};

export const themes = {
    dark: {
        bg: '#121212',
        text: '#ffffff',
        accent: '#3b82f6',
        card: 'rgba(255, 255, 255, 0.05)',
        muted: '#9ca3af',
    },
    white: {
        bg: '#fffdf7',
        text: '#121212',
        accent: '#fdc100',
        card: 'rgba(0, 0, 0, 0.05)',
        muted: '#4b5563',
    },
    cypress: {
        bg: '#0c1e2e',
        text: '#dedfd2',
        accent: '#04764e',
        card: 'rgba(0, 0, 0, 0.05)',
        muted: '#2B6278',
    },
    valetudinarian: {
        bg: '#4a3b09',
        text: '#E7DDA2',
        accent: '#c59534',
        card: 'rgba(0, 0, 0, 0.05)',
        muted: '#9a7e2b',
    },
} as const;

export type ThemeName = keyof typeof themes;
