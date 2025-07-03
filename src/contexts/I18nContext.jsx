import { createContext, useContext, useState, useEffect } from 'react'
import { translationService } from '@/services/api/translationService'

const I18nContext = createContext()

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize from localStorage or default to English
    return localStorage.getItem('preferredLanguage') || 'English'
  })
  
  const [translations, setTranslations] = useState({})

  useEffect(() => {
    // Load translations for current language
    const loadTranslations = async () => {
      try {
        const translations = await translationService.getTranslations(currentLanguage)
        setTranslations(translations)
      } catch (error) {
        console.error('Error loading translations:', error)
        // Fallback to English if translation loading fails
        if (currentLanguage !== 'English') {
          const fallbackTranslations = await translationService.getTranslations('English')
          setTranslations(fallbackTranslations)
        }
      }
    }

    loadTranslations()
  }, [currentLanguage])

  const changeLanguage = (language) => {
    setCurrentLanguage(language)
    localStorage.setItem('preferredLanguage', language)
  }

  const t = (key, defaultValue = key) => {
    return translations[key] || defaultValue
  }

  const getLanguageOptions = () => {
    return translationService.getAvailableLanguages()
  }

  const getLanguageLabel = (languageCode) => {
    const options = getLanguageOptions()
    const language = options.find(lang => lang.code === languageCode)
    return language ? language.label : languageCode
  }

  const isRTL = () => {
    return currentLanguage === 'Arabic'
  }

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getLanguageOptions,
    getLanguageLabel,
    isRTL,
    translations
  }

  return (
    <I18nContext.Provider value={value}>
      <div dir={isRTL() ? 'rtl' : 'ltr'} className={isRTL() ? 'text-right' : 'text-left'}>
        {children}
      </div>
    </I18nContext.Provider>
  )
}

export default I18nProvider