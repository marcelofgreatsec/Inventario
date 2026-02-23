'use client';

import { createContext, useContext, useEffect, useState, useLayoutEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    // Initial load - useLayoutEffect to prevent flash as much as possible on client
    useLayoutEffect(() => {
        const savedTheme = localStorage.getItem('fgreat-theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        setMounted(true);
    }, []);

    // Also watch for theme changes to update DOM
    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('fgreat-theme', theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    // Prevent hydration mismatch by not rendering theme-dependent UI until mounted
    // but we wrap the provider so children (Providers) can still render
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
