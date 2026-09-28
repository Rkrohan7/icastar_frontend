import React, { useState } from 'react'
import { ArtistCategory } from '@/types'
import Step2_ProfileForm from './Step2_ProfileForm'
import logo from '../../assets/icaster.png'
import { useTranslation } from '@/i18n'

const ArtistRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<{
    category: ArtistCategory | null
    artistTypeId: string | null
    [key: string]: any
  }>({
    category: null,
    artistTypeId: null,
  })

  const { t } = useTranslation()

  const updateFormData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  return (
    <div className='min-h-screen bg-base-bg text-gray-800 p-4 sm:p-8'>
      <div className='max-w-6xl mx-auto'>
        <header className='text-center mb-8'>
          <div className='flex justify-center py-1'>
            <img
              src={logo}
              alt='iCaster'
              className='h-16 md:h-22 w-auto object-contain'
            />
          </div>
          <p className='text-primary text-lg font-semibold mt-2'>{t('onboarding.tagline')}</p>
        </header>
        <div className='mt-8'>
          <Step2_ProfileForm
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>
      </div>
    </div>
  )
}

export default ArtistRegistrationForm
