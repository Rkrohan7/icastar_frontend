/// <reference types="vite/client" />
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { LocaleModule, Messages } from './defineMessages'

export { defineMessages } from './defineMessages'

export type Language = 'en' | 'mr'
export type TranslateVars = Record<string, string | number>

export const LANGUAGES: { code: Language; label: string; shortLabel: string }[] = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'mr', label: 'मराठी', shortLabel: 'मरा' },
]

const STORAGE_KEY = 'icastar-language'

// Every file in ./locales is one namespace named after the file:
// locales/auth.ts → t('auth.someKey'). Each file default-exports defineMessages({ en, mr }).
const localeModules = import.meta.glob<LocaleModule>('./locales/*.ts', {
  eager: true,
  import: 'default',
})

const dictionaries: Record<Language, Messages> = { en: {}, mr: {} }
for (const [path, messages] of Object.entries(localeModules)) {
  const namespace = path.slice('./locales/'.length, -'.ts'.length)
  dictionaries.en[namespace] = messages.en
  dictionaries.mr[namespace] = messages.mr
}

const readStoredLanguage = (): Language => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'mr' ? 'mr' : 'en'
  } catch {
    return 'en'
  }
}

// Module-level copy of the active language so code outside React components
// (services, plain helper functions) can translate with `translate()`.
let currentLanguage: Language = readStoredLanguage()

export const getLanguage = (): Language => currentLanguage

const lookup = (dict: Messages, key: string): string | undefined => {
  let node: string | Messages | undefined = dict
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

// `{ count }` picks `<key>_one` / `<key>_other` when those variants exist.
const resolve = (dict: Messages, key: string, vars?: TranslateVars) => {
  if (vars && typeof vars.count === 'number') {
    const plural = lookup(dict, `${key}_${vars.count === 1 ? 'one' : 'other'}`)
    if (plural !== undefined) return plural
  }
  return lookup(dict, key)
}

const interpolate = (text: string, vars?: TranslateVars) =>
  vars
    ? text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
        name in vars ? String(vars[name]) : match
      )
    : text

export const translateIn = (language: Language, key: string, vars?: TranslateVars): string => {
  const text = resolve(dictionaries[language], key, vars) ?? resolve(dictionaries.en, key, vars)
  if (text === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] Missing translation key: ${key}`)
    return key
  }
  return interpolate(text, vars)
}

const prettifyEnum = (value: string) =>
  value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

// Label for a backend enum value such as 'FULL_TIME' or 'UNDER_REVIEW' (see locales/enums.ts).
// Values without a translation fall back to a prettified form ("Full Time").
export const translateEnumIn = (language: Language, value?: string | null): string => {
  if (!value) return ''
  const key = `enums.${value.trim().toUpperCase().replace(/[\s-]+/g, '_')}`
  return lookup(dictionaries[language], key) ?? lookup(dictionaries.en, key) ?? prettifyEnum(value)
}

// Marathi month/day names with Western digits, matching the digits used everywhere else in the UI.
const MARATHI_DATE_LOCALE = 'mr-IN-u-nu-latn'

/**
 * Locale for Date#toLocaleDateString / toLocaleTimeString / toLocaleString:
 * the screen's own English locale, or Marathi while the UI is in Marathi.
 *   date.toLocaleDateString(dateLocale('en-US'), { month: 'short', day: 'numeric' })
 */
export const dateLocale = (englishLocale?: string): string | undefined =>
  currentLanguage === 'mr' ? MARATHI_DATE_LOCALE : englishLocale

/** Translate outside React components (services, plain helpers). Components should use `useTranslation`. */
export const translate = (key: string, vars?: TranslateVars) => translateIn(currentLanguage, key, vars)
export const translateEnum = (value?: string | null) => translateEnumIn(currentLanguage, value)

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, vars?: TranslateVars) => string
  tEnum: (value?: string | null) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(currentLanguage)

  const setLanguage = useCallback((next: Language) => {
    currentLanguage = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable (private mode) — the choice still applies for this session.
    }
    setLanguageState(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    // Swap the default tab title; pages that set their own title keep it.
    const defaultTitles = LANGUAGES.map(({ code }) => translateIn(code, 'common.documentTitle'))
    if (defaultTitles.includes(document.title)) {
      document.title = translateIn(language, 'common.documentTitle')
    }
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => translateIn(language, key, vars),
      tEnum: enumValue => translateEnumIn(language, enumValue),
    }),
    [language, setLanguage]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useTranslation = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used inside <LanguageProvider>')
  return ctx
}
