import React from 'react'
import { LANGUAGES, useTranslation } from '@/i18n'

interface LanguageSwitcherProps {
  className?: string
}

// Segmented English / मराठी toggle; the choice is remembered across visits.
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage, t } = useTranslation()

  return (
    <div
      role='group'
      aria-label={t('common.language.label')}
      className={`inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm ${className}`}
    >
      {LANGUAGES.map(({ code, label }) => {
        const active = code === language
        return (
          <button
            key={code}
            type='button'
            lang={code}
            onClick={() => setLanguage(code)}
            aria-pressed={active}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default LanguageSwitcher
