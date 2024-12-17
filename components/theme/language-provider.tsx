'use client';

import { createContext, useContext, useEffect } from 'react';
import { useI18n, Language } from '@/app/lib/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const i18nStore = useI18n();

    // Load saved language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'nb')) {
            i18nStore.setLanguage(savedLanguage);
        } else {
            // Set default based on browser language
            const browserLang = navigator.language.toLowerCase();
            i18nStore.setLanguage(browserLang.startsWith('nb') || browserLang.startsWith('nn') ? 'nb' : 'en');
        }
    }, []);

    // Save language changes to localStorage
    useEffect(() => {
        localStorage.setItem('language', i18nStore.language);
    }, [i18nStore.language]);

    return (
        <LanguageContext.Provider value={i18nStore}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === null) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
} 