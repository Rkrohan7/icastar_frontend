import React, { useState } from 'react'
import { Card } from '../../components/Card'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/apiClient'
import { useTranslation } from '@/i18n'

interface InputFieldProps {
  label: string
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  autoComplete?: string
  error?: string
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  onChange,
  type = 'text',
  autoComplete = 'off',
  error,
}) => (
  <div>
    <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
      {label}
    </label>
    <input
      type={type}
      name={id}
      id={id}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className={`mt-1 block w-full rounded-lg border bg-white shadow-sm transition placeholder:text-gray-400 focus:ring-2 sm:text-sm px-3 py-2.5 ${error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-primary focus:ring-primary/20'
        }`}
    />
    {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
  </div>
)

interface ToggleSwitchProps {
  label: string
  enabled: boolean
  setEnabled: (val: boolean) => void
  description: string
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, setEnabled, description }) => (
  <div className='flex items-center justify-between'>
    <div>
      <span className='text-sm font-medium text-gray-900'>{label}</span>
      <p className='text-sm text-gray-500'>{description}</p>
    </div>
    <button
      type='button'
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-gray-200'
        }`}
      onClick={() => setEnabled(!enabled)}>
      <span
        aria-hidden='true'
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  </div>
)

export const SettingsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState({
    newApplicants: true,
    messages: true,
    weeklySummary: false,
  })

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = t('settings.errors.currentRequired')
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = t('settings.errors.newRequired')
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = t('settings.errors.minLength', { count: 8 })
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = t('settings.errors.confirmRequired')
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = t('settings.errors.mismatch')
    }

    if (passwordForm.currentPassword === passwordForm.newPassword && passwordForm.newPassword) {
      errors.newPassword = t('settings.errors.sameAsCurrent')
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return

    setIsChangingPassword(true)
    try {
      const response = await api.post('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })

      if (response.data?.success) {
        toast.success(response.data.message || t('settings.toast.passwordChanged'))
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('settings.toast.passwordChangeFailed')
      toast.error(errorMessage)

      // Set specific field errors based on API response
      if (errorMessage.toLowerCase().includes('current password')) {
        setPasswordErrors(prev => ({ ...prev, currentPassword: errorMessage }))
      } else if (errorMessage.toLowerCase().includes('do not match')) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: errorMessage }))
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSave = () => {
    toast.success(t('settings.toast.saved'))
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold text-gray-900 mb-6'>{t('common.nav.settings')}</h2>

      <div className='space-y-8'>
        <Card>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>
            {t('settings.password.title')}
          </h3>
          <p className='text-sm text-gray-500 mb-6'>
            {t('settings.password.description')}
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <InputField
              label={t('settings.password.current')}
              id='currentPassword'
              type='password'
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              autoComplete='current-password'
              error={passwordErrors.currentPassword}
            />
            <div></div>
            <InputField
              label={t('settings.password.new')}
              id='newPassword'
              type='password'
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              autoComplete='new-password'
              error={passwordErrors.newPassword}
            />
            <InputField
              label={t('settings.password.confirm')}
              id='confirmPassword'
              type='password'
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete='new-password'
              error={passwordErrors.confirmPassword}
            />
            <div className='sm:col-span-2 text-right'>
              <button
                onClick={handleUpdatePassword}
                disabled={isChangingPassword}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed'>
                {isChangingPassword ? t('common.actions.updating') : t('settings.password.update')}
              </button>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className='text-lg font-semibold text-gray-800 mb-2'>
            {t('settings.emailNotifications.title')}
          </h3>
          <p className='text-sm text-gray-500 mb-6'>
            {t('settings.emailNotifications.description')}
          </p>
          <div className='space-y-6'>
            <ToggleSwitch
              label={t('settings.emailNotifications.newApplicants.label')}
              description={t('settings.emailNotifications.newApplicants.description')}
              enabled={notifications.newApplicants}
              setEnabled={val =>
                setNotifications(p => ({ ...p, newApplicants: val }))
              }
            />
            <ToggleSwitch
              label={t('settings.emailNotifications.directMessages.label')}
              description={t('settings.emailNotifications.directMessages.description')}
              enabled={notifications.messages}
              setEnabled={val =>
                setNotifications(p => ({ ...p, messages: val }))
              }
            />
            <ToggleSwitch
              label={t('settings.emailNotifications.weeklySummary.label')}
              description={t('settings.emailNotifications.weeklySummary.description')}
              enabled={notifications.weeklySummary}
              setEnabled={val =>
                setNotifications(p => ({ ...p, weeklySummary: val }))
              }
            />
          </div>
        </Card>
      </div>

      <div className='mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3'>
        <button
          onClick={handleCancel}
          className='px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors'>
          {t('common.actions.cancel')}
        </button>
        <button
          onClick={handleSave}
          className='inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'>
          {t('settings.saveSettings')}
        </button>
      </div>
    </div>
  )
}
