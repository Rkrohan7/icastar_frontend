import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logo from '../../assets/icaster.png'
import { useTranslation } from '@/i18n'

// Text lives in i18n/locales/privacy.ts; these ids set the order list items appear in.
const COLLECTED_INFO_IDS = ['personal', 'nonPersonal', 'content']
const USE_ITEM_IDS = ['i1', 'i2', 'i3', 'i4', 'i5']
const SHARING_ITEM_IDS = ['i1', 'i2', 'i3', 'i4']

const PrivacyPolicyPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <img src={logo} alt="iCastar" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden md:inline">{t('privacy.backToHome')}</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                {t('privacy.title')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('privacy.lastUpdated')}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s1.title')}</h4>
                  <p className="mb-2">{t('privacy.sections.s1.intro')}</p>
                  <div className="space-y-3 ml-4">
                    {COLLECTED_INFO_IDS.map(id => (
                      <div key={id}>
                        <strong className="text-gray-900">{t(`privacy.sections.s1.items.${id}.label`)}</strong> {t(`privacy.sections.s1.items.${id}.text`)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s2.title')}</h4>
                  <p className="mb-2">{t('privacy.sections.s2.intro')}</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {USE_ITEM_IDS.map(id => (
                      <li key={id}>{t(`privacy.sections.s2.items.${id}`)}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s3.title')}</h4>
                  <p className="mb-2">{t('privacy.sections.s3.intro')}</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {SHARING_ITEM_IDS.map(id => (
                      <li key={id}>{t(`privacy.sections.s3.items.${id}`)}</li>
                    ))}
                  </ul>
                  <p className="mt-2">{t('privacy.sections.s3.outro')}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s4.title')}</h4>
                  <p>{t('privacy.sections.s4.emailBefore')}<a href="mailto:admin.icastar@gmail.com" className="text-orange-600 hover:text-orange-700 underline">admin.icastar@gmail.com</a>{t('privacy.sections.s4.emailAfter')}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s5.title')}</h4>
                  <p>{t('privacy.sections.s5.text')}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s6.title')}</h4>
                  <p>{t('privacy.sections.s6.emailBefore')}<a href="mailto:admin.icastar@gmail.com" className="text-orange-600 hover:text-orange-700 underline">admin.icastar@gmail.com</a>{t('privacy.sections.s6.emailAfter')}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s7.title')}</h4>
                  <p>{t('privacy.sections.s7.text')}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s8.title')}</h4>
                  <p>{t('privacy.sections.s8.text')}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{t('privacy.sections.s9.title')}</h4>
                  <p>{t('privacy.sections.s9.text')}</p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-bold text-gray-900 mb-2">{t('privacy.contact.title')}</h4>
                <p className="text-gray-700">
                  {t('privacy.contact.text')}
                </p>
                <a
                  href="mailto:admin.icastar@gmail.com"
                  className="inline-block mt-3 text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                  admin.icastar@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage
