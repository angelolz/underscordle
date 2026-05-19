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
        accent: '#1C1C1C',
        card: 'rgba(255, 255, 255, 0.05)',
        muted: '#9ca3af',
    },
    white: {
        bg: '#ffffff',
        text: '#121212',
        accent: '#2563eb',
        card: 'rgba(0, 0, 0, 0.05)',
        muted: '#4b5563',
    },
} as const;

export type ThemeName = keyof typeof themes;
