import React, { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import heroBg from '@/assets/hero-stage.jpg'

const BASE_URL = 'https://api.icastar.com/api'

const bgStyle = {
  backgroundImage: `url(${heroBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
    <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black opacity-90" />
    <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-xl" />
    <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl" />
    <div className="relative z-10 w-full max-w-md px-4 py-8">{children}</div>
  </div>
)

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid')
      setError('No reset token provided.')
      return
    }

    fetch(`${BASE_URL}/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setTokenStatus('valid')
          setEmail(data.email || '')
        } else {
          setTokenStatus('invalid')
          const msg = typeof data.error === 'string' ? data.error : data.error?.message || data.message || 'This reset link is invalid or has expired.'
          setError(msg)
        }
      })
      .catch(() => {
        setTokenStatus('invalid')
        setError('Failed to verify reset link. Please try again.')
      })
  }, [token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      })
      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => navigate('/auth'), 3000)
      } else {
        const msg = typeof data.error === 'string' ? data.error : data.error?.message || data.message || 'Failed to reset password. Please try again.'
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

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black opacity-90" />
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl" />
      <div className="relative z-10 w-full max-w-md px-4 py-8">{children}</div>
    </div>
  )

  if (tokenStatus === 'loading') {
    return (
      <Wrapper>
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl text-center">
          <CardContent className="pt-10 pb-10">
            <Loader2 className="h-10 w-10 animate-spin text-orange-400 mx-auto mb-4" />
            <p className="text-white/70">Verifying reset link...</p>
          </CardContent>
        </Card>
      </Wrapper>
    )
  }

  if (tokenStatus === 'invalid') {
    return (
      <Wrapper>
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Invalid or Expired Link</h2>
            <p className="text-white/70 mb-6">{error || 'This password reset link is invalid or has expired.'}</p>
            <Link
              to="/forgot-password"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-sm font-semibold rounded-lg hover:from-orange-700 hover:to-amber-600 transition-all mb-4"
            >
              Request New Link
            </Link>
            <div className="mt-2">
              <Link to="/auth" className="inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </Wrapper>
    )
  }

  if (success) {
    return (
      <Wrapper>
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Password Reset Successful!</h2>
            <p className="text-white/70 mb-2">Your password has been updated successfully.</p>
            <p className="text-sm text-white/50">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
          {email && (
            <CardDescription className="text-white/70">
              Enter a new password for <span className="text-white">{email}</span>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-white/90">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError('') }}
                  required
                  minLength={8}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-transparent"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-white/40">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white/90">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError('') }}
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Wrapper>
  )
}

export default ResetPasswordPage
