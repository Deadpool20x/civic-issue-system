'use client'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'hi', label: 'हि', full: 'हिंदी' },
    { code: 'gu', label: 'ગુ', full: 'ગુજરાતી' },
]

export default function LanguageSelector() {
    const { i18n } = useTranslation()
    const current = i18n.language?.slice(0, 2) || 'en'

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        // Force refresh or just let react-i18next handle it
    };

    return (
        <div className="flex items-center gap-1 bg-page-navbar border border-border-card rounded-full px-2 py-1 shadow-sm">
            {LANGUAGES.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
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
    )
}
