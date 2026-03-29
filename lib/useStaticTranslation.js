export function useTranslation() {
  const t = (key, fallbackOrOptions) => {
    if (typeof fallbackOrOptions === 'string') {
      return fallbackOrOptions
    }
    return key
  }

  return {
    t,
    i18n: {
      language: 'en',
      changeLanguage: async () => {}
    }
  }
}
