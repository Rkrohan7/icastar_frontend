import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logo from '../../assets/icaster.png'
import { useTranslation } from '@/i18n'

// Text lives in i18n/locales/terms.ts; these ids set the order the clauses appear in.
const DEFINITION_IDS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']
const CLAUSES: { id: string; items?: string[] }[] = [
  { id: 'c1' },
  { id: 'c2' },
  { id: 'c3' },
  { id: 'c4', items: ['i1', 'i2', 'i3'] },
  { id: 'c5' },
  { id: 'c6' },
  { id: 'c7' },
  { id: 'c8' },
  { id: 'c9' },
  { id: 'c10' },
  { id: 'c11' },
  { id: 'c12' },
]

const TermsAndConditionsPage = () => {
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
            <span className="hidden md:inline">{t('terms.backToHome')}</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                {t('terms.title')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('terms.lastUpdated')}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
              {/* Definition of Terms */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.definitions.title')}</h3>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {DEFINITION_IDS.map(id => (
                    <div key={id}>
                      <strong className="text-gray-900">{t(`terms.definitions.${id}.term`)}</strong> {t(`terms.definitions.${id}.text`)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('terms.title')}</h3>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  {CLAUSES.map(({ id, items }) => (
                    <div key={id}>
                      <h4 className="font-bold text-gray-900 mb-2">{t(`terms.clauses.${id}.title`)}</h4>
                      {items ? (
                        <>
                          <p className="mb-2">{t(`terms.clauses.${id}.intro`)}</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {items.map(item => (
                              <li key={item}>{t(`terms.clauses.${id}.items.${item}`)}</li>
                            ))}
                          </ul>
                          <p className="mt-2">{t(`terms.clauses.${id}.outro`)}</p>
                        </>
                      ) : (
                        <p>{t(`terms.clauses.${id}.text`)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-bold text-gray-900 mb-2">{t('terms.contact.title')}</h4>
                <p className="text-gray-700">
                  {t('terms.contact.text')}
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

export default TermsAndConditionsPage
