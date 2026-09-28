import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import heroBg from '@/assets/hero-stage.jpg'
import { useTranslation } from '@/i18n'

const BASE_URL = 'https://api.icastar.com/api'

const ForgotPasswordPage = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        const msg = typeof data.error === 'string' ? data.error : data.error?.message || data.message || t('common.status.somethingWentWrong')
        setError(msg)
      }
    } catch {
      setError(t('forgotPassword.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const bgStyle = {
    backgroundImage: `url(${heroBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black opacity-90" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl" />
        <div className="relative z-10 w-full max-w-md px-4 py-8">
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Mail className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{t('forgotPassword.sent.title')}</h2>
              <p className="text-white/70 mb-2">
                {t('forgotPassword.sent.messageBefore')}<span className="text-white font-medium">{email}</span>{t('forgotPassword.sent.messageAfter')}
              </p>
              <p className="text-sm text-white/50 mb-8">{t('forgotPassword.sent.expires')}</p>
              <Link
                to="/auth"
                className="inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                {t('forgotPassword.backToLogin')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black opacity-90" />
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl" />

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">{t('forgotPassword.title')}</CardTitle>
            <CardDescription className="text-white/70">
              {t('forgotPassword.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-white/90">{t('forgotPassword.emailLabel')}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('forgotPassword.sending')}
                  </>
                ) : (
                  t('forgotPassword.sendResetLink')
                )}
              </Button>

              <div className="pt-4 border-t border-white/10 text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  {t('forgotPassword.backToLogin')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
