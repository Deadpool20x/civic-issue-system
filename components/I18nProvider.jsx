'use client';

import { useEffect, useState } from 'react';
import '@/lib/i18n';

export default function I18nProvider({ children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return children without i18n initially to avoid hydration mismatch
        // or return a loader
        return <>{children}</>;
    }

    return <>{children}</>;
}
