'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useStaticTranslation';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हि' },
  { code: 'gu', label: 'Gujarati', native: 'ગુ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = i18n.language?.slice(0, 2) || 'en';

  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#333333] rounded-full px-2 py-1">
        {LANGUAGES.map(lang => (
          <div key={lang.code} className="px-2.5 py-1 rounded-full text-xs font-semibold text-[#666666]">
            {lang.native}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#333333] rounded-full px-2 py-1 shadow-sm">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          title={lang.label}
          className={`
            px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200
            ${currentLang === lang.code
              ? 'bg-[#F5A623] text-black shadow-md'
              : 'text-[#AAAAAA] hover:text-white hover:bg-white/5'
            }
          `}
        >
          {lang.native}
        </button>
      ))}
    </div>
  );
}
