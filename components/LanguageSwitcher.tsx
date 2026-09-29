import React from 'react'
import { Languages } from 'lucide-react'
import { LANGUAGES, useTranslation } from '@/i18n'

interface LanguageSwitcherProps {
  className?: string
  // Below the sm breakpoint, show one small button for the other language instead of
  // the two-button toggle, so a floating switcher covers less of the page.
  compactOnMobile?: boolean
}

// Segmented English / मराठी toggle; the choice is remembered across visits.
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '', compactOnMobile = false }) => {
  const { language, setLanguage, t } = useTranslation()
  const other = LANGUAGES.find(({ code }) => code !== language) ?? LANGUAGES[0]

  const segmented = (
    <div
      role='group'
      aria-label={t('common.language.label')}
      className={`${compactOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'} items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm ${className}`}
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

  if (!compactOnMobile) return segmented

  return (
    <>
      <button
        type='button'
        lang={other.code}
        onClick={() => setLanguage(other.code)}
        aria-label={`${t('common.language.label')}: ${other.label}`}
        className={`sm:hidden inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 backdrop-blur ${className}`}
      >
        <Languages className='h-3.5 w-3.5 text-primary' />
        {other.label}
      </button>
      {segmented}
    </>
  )
}

export default LanguageSwitcher
