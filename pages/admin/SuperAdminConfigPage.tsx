import React, { useEffect, useState } from 'react'
import {
  SettingsIcon,
  ShieldCheckIcon,
  BellIcon,
  BriefcaseIcon,
  CheckCircleIcon,
} from '../../components/icons/IconComponents'
import superAdminService, { SystemConfig } from '../../services/superAdminService'

type FieldType = 'text' | 'number' | 'boolean'

interface FieldDef {
  key: keyof SystemConfig
  label: string
  type: FieldType
  category: string
  description?: string
}

const SECTIONS: { title: string; icon: React.ComponentType<{ className?: string }>; fields: FieldDef[] }[] = [
  {
    title: 'Platform',
    icon: SettingsIcon,
    fields: [
      { key: 'platformName', label: 'Platform Name', type: 'text', category: 'PLATFORM' },
      { key: 'platformEmail', label: 'Platform Email', type: 'text', category: 'PLATFORM' },
      { key: 'supportEmail', label: 'Support Email', type: 'text', category: 'PLATFORM' },
      { key: 'supportPhone', label: 'Support Phone', type: 'text', category: 'PLATFORM' },
    ],
  },
  {
    title: 'Authentication & Verification',
    icon: ShieldCheckIcon,
    fields: [
      { key: 'allowNewRegistrations', label: 'Allow New Registrations', type: 'boolean', category: 'AUTH' },
      { key: 'requireEmailVerification', label: 'Require Email Verification', type: 'boolean', category: 'AUTH' },
      { key: 'requireMobileVerification', label: 'Require Mobile Verification', type: 'boolean', category: 'AUTH' },
      { key: 'requireProfileApproval', label: 'Require Profile Approval', type: 'boolean', category: 'AUTH' },
      { key: 'otpExpirationMinutes', label: 'OTP Expiration (minutes)', type: 'number', category: 'AUTH' },
      { key: 'otpLength', label: 'OTP Length', type: 'number', category: 'AUTH' },
      { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', category: 'AUTH' },
    ],
  },
  {
    title: 'Job Settings',
    icon: BriefcaseIcon,
    fields: [
      { key: 'maxJobsPerRecruiter', label: 'Max Jobs per Recruiter', type: 'number', category: 'JOB_SETTINGS' },
      { key: 'jobExpirationDays', label: 'Job Expiration (days)', type: 'number', category: 'JOB_SETTINGS' },
      { key: 'maxApplicationsPerArtist', label: 'Max Applications per Artist', type: 'number', category: 'JOB_SETTINGS' },
    ],
  },
  {
    title: 'Notifications',
    icon: BellIcon,
    fields: [
      { key: 'emailNotificationsEnabled', label: 'Email Notifications', type: 'boolean', category: 'NOTIFICATIONS' },
      { key: 'smsNotificationsEnabled', label: 'SMS Notifications', type: 'boolean', category: 'NOTIFICATIONS' },
      { key: 'pushNotificationsEnabled', label: 'Push Notifications', type: 'boolean', category: 'NOTIFICATIONS' },
      { key: 'inAppNotificationsEnabled', label: 'In-App Notifications', type: 'boolean', category: 'NOTIFICATIONS' },
    ],
  },
]

export const SuperAdminConfigPage: React.FC = () => {
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
        setError('Unable to load configuration. Please try again.')
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
      alert(`Failed to update ${field.label}`)
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
        <div className='text-gray-500'>Loading configuration...</div>
      </div>
    )
  }

  if (error || !draft) {
    return (
      <div className='p-6 flex items-center justify-center min-h-[400px]'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg'>
          {error || 'No configuration available'}
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {SECTIONS.map((section) => (
        <div key={section.title} className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50'>
            <section.icon className='h-5 w-5 text-[#E36A3A]' />
            <h3 className='text-lg font-bold text-gray-900'>{section.title}</h3>
          </div>
          <div className='divide-y divide-gray-100'>
            {section.fields.map((field) => (
              <div key={field.key} className='px-6 py-4 flex items-center justify-between gap-4'>
                <div className='flex-1'>
                  <label className='text-sm font-medium text-gray-900'>{field.label}</label>
                  {field.description && (
                    <p className='text-xs text-gray-500 mt-0.5'>{field.description}</p>
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
                      <CheckCircleIcon className='h-4 w-4' /> Saved
                    </span>
                  ) : (
                    <button
                      onClick={() => saveField(field)}
                      disabled={!isDirty(field.key) || saving === field.key}
                      className='px-3 py-1.5 text-sm font-medium bg-[#E36A3A] text-white rounded-lg hover:bg-[#C95428] disabled:opacity-30 disabled:cursor-not-allowed transition-colors'>
                      {saving === field.key ? 'Saving...' : 'Save'}
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
