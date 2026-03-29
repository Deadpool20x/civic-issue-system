'use client';

import { useTranslation } from '@/lib/useStaticTranslation';
import { useEffect, useState } from 'react';

const LANGUAGES = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'hi', label: 'हि', full: 'हिंदी' },
    { code: 'gu', label: 'ગુ', full: 'ગુજરાતી' },
];

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const current = i18n.language?.slice(0, 2) || 'en';

    const changeLanguage = async (code) => {
        try {
            await i18n.changeLanguage(code);
            // i18next-browser-languagedetector will automatically update localStorage
            // because we configured lookupLocalStorage: 'language' in lib/i18n.js
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-1 bg-page-navbar border border-border-card rounded-full px-2 py-1 shadow-sm">
            {LANGUAGES.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    type="button"
                    title={lang.full}
                    className={`
                        px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200
                        ${current === lang.code
                            ? 'bg-gold text-page-bg shadow-md'
                            : 'text-text-muted hover:text-text-main hover:bg-white/5'
                        }
                    `}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
