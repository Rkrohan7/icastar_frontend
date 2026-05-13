import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import heroBg from '@/assets/hero-stage.jpg'

const BASE_URL = 'https://app.icastar.com/api'

const ForgotPasswordPage = () => {
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
        const msg = typeof data.error === 'string' ? data.error : data.error?.message || data.message || 'Something went wrong. Please try again.'
        setError(msg)
      }
    } catch {
      setError('Unable to connect to the server. Please check your internet connection.')
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
              <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
              <p className="text-white/70 mb-2">
                If an account exists with <span className="text-white font-medium">{email}</span>, you will receive a password reset link shortly.
              </p>
              <p className="text-sm text-white/50 mb-8">Link expires in 30 minutes</p>
              <Link
                to="/auth"
                className="inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Login
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
            <CardTitle className="text-2xl text-white">Forgot Password</CardTitle>
            <CardDescription className="text-white/70">
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-white/90">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
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
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="pt-4 border-t border-white/10 text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Back to Login
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
