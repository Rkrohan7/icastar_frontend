import React, { useEffect, useState } from 'react'
import {
  SettingsIcon,
  ShieldCheckIcon,
  BellIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '../../components/icons/IconComponents'
import superAdminService, { SystemConfig } from '../../services/superAdminService'
import { useTranslation } from '@/i18n'

type FieldType = 'text' | 'number' | 'boolean'

// `key` and `category` are sent to the backend unchanged; only the label/description keys are translated.
interface FieldDef {
  key: keyof SystemConfig
  labelKey: string
  type: FieldType
  category: string
  descriptionKey?: string
}

const SECTIONS: { titleKey: string; icon: React.ComponentType<{ className?: string }>; fields: FieldDef[] }[] = [
  {
    titleKey: 'adminConfig.sections.platform',
    icon: SettingsIcon,
    fields: [
      { key: 'platformName', labelKey: 'adminConfig.fields.platformName', type: 'text', category: 'PLATFORM' },
      { key: 'platformEmail', labelKey: 'adminConfig.fields.platformEmail', type: 'text', category: 'PLATFORM' },
      { key: 'supportEmail', labelKey: 'adminConfig.fields.supportEmail', type: 'text', category: 'PLATFORM' },
      { key: 'supportPhone', labelKey: 'adminConfig.fields.supportPhone', type: 'text', category: 'PLATFORM' },
    ],
  },
  {
    titleKey: 'adminConfig.sections.auth',
    icon: ShieldCheckIcon,
    fields: [
      { key: 'allowNewRegistrations', labelKey: 'adminConfig.fields.allowNewRegistrations', type: 'boolean', category: 'AUTH' },
      { key: 'requireEmailVerification', labelKey: 'adminConfig.fields.requireEmailVerification', type: 'boolean', category: 'AUTH' },
      { key: 'requireMobileVerification', labelKey: 'adminConfig.fields.requireMobileVerification', type: 'boolean', category: 'AUTH' },
      { key: 'requireProfileApproval', labelKey: 'adminConfig.fields.requireProfileApproval', type: 'boolean', category: 'AUTH' },
      { key: 'otpExpirationMinutes', labelKey: 'adminConfig.fields.otpExpirationMinutes', type: 'number', category: 'AUTH' },
      { key: 'otpLength', labelKey: 'adminConfig.fields.otpLength', type: 'number', category: 'AUTH' },
      { key: 'maxLoginAttempts', labelKey: 'adminConfig.fields.maxLoginAttempts', type: 'number', category: 'AUTH' },
    ],
  },
  {
    titleKey: 'adminConfig.sections.jobSettings',
    icon: BriefcaseIcon,
    fields: [
      { key: 'maxJobsPerRecruiter', labelKey: 'adminConfig.fields.maxJobsPerRecruiter', type: 'number', category: 'JOB_SETTINGS' },
      { key: 'jobExpirationDays', labelKey: 'adminConfig.fields.jobExpirationDays', type: 'number', category: 'JOB_SETTINGS' },
      { key: 'maxApplicationsPerArtist', labelKey: 'adminConfig.fields.maxApplicationsPerArtist', type: 'number', category: 'JOB_SETTINGS' },
    ],
  },
  {
    titleKey: 'adminConfig.sections.landingPage',
    icon: ChartBarIcon,
    fields: [
      { key: 'landingStatsEnabled', labelKey: 'adminConfig.fields.landingStatsEnabled', type: 'boolean', category: 'LANDING_STATS', descriptionKey: 'adminConfig.descriptions.landingStatsEnabled' },
      { key: 'landingActiveArtists', labelKey: 'adminConfig.fields.landingActiveArtists', type: 'number', category: 'LANDING_STATS', descriptionKey: 'adminConfig.descriptions.landingActiveArtists' },
      { key: 'landingCastingDirectors', labelKey: 'adminConfig.fields.landingCastingDirectors', type: 'number', category: 'LANDING_STATS' },
      { key: 'landingSuccessfulAuditions', labelKey: 'adminConfig.fields.landingSuccessfulAuditions', type: 'number', category: 'LANDING_STATS' },
      { key: 'landingSuccessRate', labelKey: 'adminConfig.fields.landingSuccessRate', type: 'number', category: 'LANDING_STATS' },
      { key: 'landingBlogsEnabled', labelKey: 'adminConfig.fields.landingBlogsEnabled', type: 'boolean', category: 'LANDING_STATS', descriptionKey: 'adminConfig.descriptions.landingBlogsEnabled' },
    ],
  },
  {
    titleKey: 'adminConfig.sections.notifications',
    icon: BellIcon,
    fields: [
      { key: 'emailNotificationsEnabled', labelKey: 'adminConfig.fields.emailNotificationsEnabled', type: 'boolean', category: 'NOTIFICATIONS' },
      { key: 'smsNotificationsEnabled', labelKey: 'adminConfig.fields.smsNotificationsEnabled', type: 'boolean', category: 'NOTIFICATIONS' },
      { key: 'pushNotificationsEnabled', labelKey: 'adminConfig.fields.pushNotificationsEnabled', type: 'boolean', category: 'NOTIFICATIONS' },
      { key: 'inAppNotificationsEnabled', labelKey: 'adminConfig.fields.inAppNotificationsEnabled', type: 'boolean', category: 'NOTIFICATIONS' },
    ],
  },
]

export const SuperAdminConfigPage: React.FC = () => {
  const { t } = useTranslation()
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [draft, setDraft] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<keyof SystemConfig | null>(null)
  const [savedKey, setSavedKey] = useState<keyof SystemConfig | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const c = await superAdminService.getConfig()
        setConfig(c)
        setDraft(c)
      } catch (err) {
        console.error('Failed to load config:', err)
        // A translation key, rendered with t() so it follows the language toggle
        setError('adminConfig.loadFailed')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const saveField = async (field: FieldDef) => {
    if (!draft) return
    const value = draft[field.key]
    try {
      setSaving(field.key)
      setSavedKey(null)
      await superAdminService.updateConfig({
        key: field.key,
        value: String(value),
        category: field.category,
      })
      setConfig({ ...draft })
      setSavedKey(field.key)
      setTimeout(() => setSavedKey((k) => (k === field.key ? null : k)), 2000)
    } catch (err) {
      console.error('Failed to update config:', err)
      alert(t('adminConfig.updateFailed', { field: t(field.labelKey) }))
    } finally {
      setSaving(null)
    }
  }

  const updateDraft = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    if (!draft) return
    setDraft({ ...draft, [key]: value })
  }

  const isDirty = (key: keyof SystemConfig) =>
    config && draft && config[key] !== draft[key]

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='text-gray-500'>{t('adminConfig.loading')}</div>
      </div>
    )
  }

  if (error || !draft) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg'>
          {t(error || 'adminConfig.noConfig')}
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {SECTIONS.map((section) => (
        <div key={section.titleKey} className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50'>
            <section.icon className='h-5 w-5 text-[#E36A3A]' />
            <h3 className='text-lg font-bold text-gray-900'>{t(section.titleKey)}</h3>
          </div>
          <div className='divide-y divide-gray-100'>
            {section.fields.map((field) => (
              <div key={field.key} className='px-6 py-4 flex items-center justify-between gap-4'>
                <div className='flex-1'>
                  <label className='text-sm font-medium text-gray-900'>{t(field.labelKey)}</label>
                  {field.descriptionKey && (
                    <p className='text-xs text-gray-500 mt-0.5'>{t(field.descriptionKey)}</p>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  {field.type === 'boolean' ? (
                    <ToggleSwitch
                      enabled={draft[field.key] as boolean}
                      onChange={(v) => updateDraft(field.key, v as SystemConfig[typeof field.key])}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type='number'
                      value={draft[field.key] as number}
                      onChange={(e) =>
                        updateDraft(field.key, Number(e.target.value) as SystemConfig[typeof field.key])
                      }
                      className='w-32 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
                    />
                  ) : (
                    <input
                      type='text'
                      value={draft[field.key] as string}
                      onChange={(e) =>
                        updateDraft(field.key, e.target.value as SystemConfig[typeof field.key])
                      }
                      className='w-64 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
                    />
                  )}
                  {savedKey === field.key ? (
                    <span className='flex items-center gap-1 text-xs text-green-600'>
                      <CheckCircleIcon className='h-4 w-4' /> {t('adminConfig.saved')}
                    </span>
                  ) : (
                    <button
                      onClick={() => saveField(field)}
                      disabled={!isDirty(field.key) || saving === field.key}
                      className='px-3 py-1.5 text-sm font-medium bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] disabled:opacity-30 disabled:cursor-not-allowed transition-colors'>
                      {saving === field.key ? t('common.actions.saving') : t('common.actions.save')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (v: boolean) => void }> = ({
  enabled,
  onChange,
}) => (
  <button
    type='button'
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? 'bg-[#E36A3A]' : 'bg-gray-300'
    }`}>
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

export default SuperAdminConfigPage
