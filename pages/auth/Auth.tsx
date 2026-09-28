import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  EyeOff,
  Star,
  Camera,
  Users,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import heroBg from '@/assets/hero-stage.jpg'
import authService, {
  type LoginRequest,
  type RegisterRequest,
} from '@/services/userService'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { UserRole } from '@/types/types'
import { useTranslation } from '@/i18n'

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mobile, setMobile] = useState('')
  const [role, setRole] = useState<UserRole>()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  const navigate = useNavigate()
  const location = useLocation()
  const { t, tEnum } = useTranslation()

  // Clear errors when switching tabs
  useEffect(() => {
    setErrors({})
  }, [activeTab])

  // Read role and initial tab from query params (passed from AuthPage / public pages)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const roleParam = params.get('role')
    if (roleParam === UserRole.ARTIST || roleParam === UserRole.RECRUITER) {
      setRole(roleParam as UserRole)
    }
    if (params.get('tab') === 'signup') {
      setActiveTab('signup')
    }
  }, [location.search])

  const validateSignIn = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) {
      newErrors.email = t('auth.validation.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid')
    }
    if (!password) {
      newErrors.password = t('auth.validation.passwordRequired')
    } else if (password.length < 6) {
      newErrors.password = t('auth.validation.passwordMin')
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateSignIn()) return
    setIsLoading(true)
    try {
      const credentials: LoginRequest = { email, password }
      const { data } = await authService.login(credentials)

      const userRole = data?.role as UserRole
      localStorage.setItem('role', userRole)
      setRole(userRole)

      toast.success(t('auth.toast.loginSuccess'))

      // Admins land in the super-admin section, not the user dashboard
      if (userRole === UserRole.ADMIN) {
        navigate('/admin/dashboard')
        return
      }

      // Check onboarding status using /api/auth/me
      if (userRole === UserRole.ARTIST) {
        try {
          // Call /api/auth/me to get user info with onboarding status
          const user = await authService.getMe()

          // Check isOnboardingComplete flag from user data
          const isOnboardingComplete = user?.isOnboardingComplete === true

          // Store onboarding status in localStorage
          localStorage.setItem('isOnboardingComplete', String(isOnboardingComplete))

          if (isOnboardingComplete) {
            // User has completed onboarding, go to dashboard
            navigate('/dashboard')
          } else {
            // User has not completed onboarding, redirect to onboarding
            navigate('/onboarding')
          }
        } catch (error) {
          // If API fails, redirect to onboarding to be safe
          console.error('Failed to fetch user info:', error)
          localStorage.setItem('isOnboardingComplete', 'false')
          navigate('/onboarding')
        }
      } else {
        // For RECRUITER or other roles, go directly to dashboard
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Sign in failed:', error)
      const resData = error?.response?.data
      const apiMsg = resData?.error || resData?.message

      if (error?.code === 'ERR_NETWORK') {
        toast.error(t('auth.toast.networkError'))
      } else if (apiMsg) {
        const msg = apiMsg.toLowerCase()
        if (msg.includes('email') || msg.includes('password') || msg.includes('invalid') || msg.includes('credential')) {
          setErrors({ email: ' ', password: apiMsg })
        }
        toast.error(apiMsg)
      } else {
        toast.error(t('auth.toast.signInFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const validateSignUp = (): boolean => {
    const newErrors: Record<string, string> = {}

    const fn = firstName.trim()
    const ln = lastName.trim()
    if (!fn) {
      newErrors.firstName = t('auth.validation.firstNameRequired')
    } else if (fn.length < 2 || fn.length > 50) {
      newErrors.firstName = t('auth.validation.firstNameLength')
    }
    if (!ln) {
      newErrors.lastName = t('auth.validation.lastNameRequired')
    } else if (ln.length < 2 || ln.length > 50) {
      newErrors.lastName = t('auth.validation.lastNameLength')
    }
    if (!email.trim()) {
      newErrors.email = t('auth.validation.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid')
    }
    const rawMobile = mobile.trim()
    const normalizedMobile = rawMobile.replace(/[\s\-().]/g, '')
    if (!rawMobile) {
      newErrors.mobile = t('auth.validation.mobileRequired')
    } else if (!/^[1-9]\d{9}$/.test(normalizedMobile)) {
      newErrors.mobile = t('auth.validation.mobileInvalid')
    }
    if (!password) {
      newErrors.password = t('auth.validation.passwordRequired')
    } else if (password.length < 6) {
      newErrors.password = t('auth.validation.passwordMin')
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired')
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordsMismatch')
    }
    if (!role) {
      newErrors.role = t('auth.validation.roleRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    // The submit button is disabled until terms are accepted; this also covers other submit paths.
    if (!acceptedTerms) return
    if (!validateSignUp()) return
    setIsLoading(true)
    try {
      const rawMobile = mobile.trim()
      const normalizedMobile = rawMobile.replace(/[\s\-().]/g, '')
      const userData: RegisterRequest = {
        email,
        password,
        firstName,
        lastName,
        mobile: normalizedMobile,
        role,
      }
      await authService.register(userData)
      toast.success(t('auth.toast.signUpSuccess'))
      setAcceptedTerms(false)
      setActiveTab('signin')
    } catch (error: any) {
      console.error('Sign up failed:', error)
      const resData = error?.response?.data
      const apiMsg = resData?.error || resData?.message

      if (error?.code === 'ERR_NETWORK') {
        toast.error(t('auth.toast.networkError'))
      } else if (apiMsg) {
        const msg = apiMsg.toLowerCase()
        const fieldErrors: Record<string, string> = {}
        if (msg.includes('email')) fieldErrors.email = apiMsg
        if (msg.includes('mobile') || msg.includes('phone')) fieldErrors.mobile = apiMsg
        if (msg.includes('password')) fieldErrors.password = apiMsg
        if (msg.includes('first name') || msg.includes('firstname')) fieldErrors.firstName = apiMsg
        if (msg.includes('last name') || msg.includes('lastname')) fieldErrors.lastName = apiMsg
        if (Object.keys(fieldErrors).length > 0) setErrors(prev => ({ ...prev, ...fieldErrors }))
        toast.error(apiMsg)
      } else {
        toast.error(t('auth.toast.signUpFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center relative overflow-hidden'
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className='absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black opacity-90' />

      {/* Floating elements */}
      <div className='absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-xl' />
      <div className='absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full blur-xl' />
      <div className='absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-xl' />

      <div className='relative z-10 w-full max-w-md px-4 py-8'>
        <Card className='backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl'>
          <CardHeader className='text-center pb-4'>
            <div className='flex justify-center mb-4'>
              <Badge
                variant='secondary'
                className='bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-white border-white/20'>
                {t('auth.welcome')}
              </Badge>
            </div>
            <CardTitle className='text-2xl text-white'>{t('auth.title')}</CardTitle>
            <CardDescription className='text-white/70'>
              {t('auth.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value)
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                setFirstName('')
                setLastName('')
                setMobile('')
                setAcceptedTerms(false)
                setErrors({})
              }}
              defaultValue='signin'
              className='w-full'>
              <TabsList className='grid w-full grid-cols-2 bg-white/10 border border-white/20'>
                <TabsTrigger
                  value='signin'
                  className='text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white'>
                  {t('common.actions.signIn')}
                </TabsTrigger>
                <TabsTrigger
                  value='signup'
                  className='text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white'>
                  {t('common.actions.signUp')}
                </TabsTrigger>
              </TabsList>

              {/* Sign In Form */}
              <TabsContent value='signin'>
                <form onSubmit={handleSignIn} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='signin-email' className='text-white/90'>{t('common.labels.email')}</Label>
                    <Input
                      id='signin-email'
                      placeholder={t('auth.placeholders.email')}
                      value={email}
                      onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '', password: '' })) }}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && errors.email.trim() && (
                      <p className='text-xs text-red-400'>{errors.email}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='signin-password' className='text-white/90'>
                      {t('common.labels.password')}
                    </Label>
                    <div className='relative'>
                      <Input
                        id='signin-password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.placeholders.password')}
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '', email: '' })) }}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10 ${errors.password ? 'border-red-500' : ''
                          }`}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    {errors.password && errors.password.trim() && (
                      <p className='text-xs text-red-400 mt-1'>{errors.password}</p>
                    )}
                    <div className='flex justify-end mt-1'>
                      <Link
                        to='/forgot-password'
                        className='text-xs text-white/50 hover:text-white/80 transition-colors'
                      >
                        {t('auth.forgotPassword')}
                      </Link>
                    </div>
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition-all duration-300'
                    disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        {t('auth.signingIn')}
                      </>
                    ) : (
                      t('common.actions.signIn')
                    )}
                  </Button>
                  <div className='mt-6 pt-4 border-t border-white/10 text-center'>
                    <Link
                      to='/'
                      className='inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors'>
                      <ArrowLeft className='h-3.5 w-3.5 mr-1.5' />
                      {t('auth.backToHome')}
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Sign Up Form */}
              <TabsContent value='signup'>
                <form onSubmit={handleSignUp} className='space-y-4'>
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {/* first Name Field */}
                      <div className='space-y-2 md:col-span-2'>
                        <div className='flex justify-between items-center'>
                          <Label
                            htmlFor='signup-first-name'
                            className='text-white/90'>
                            {t('common.labels.firstName')}
                          </Label>
                          {errors.firstName && (
                            <span className='text-xs text-red-400'>
                              {errors.firstName}
                            </span>
                          )}
                        </div>
                        <Input
                          id='signup-first-name'
                          type='text'
                          placeholder={t('auth.placeholders.firstName')}
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${errors.firstName ? 'border-red-500' : ''
                            }`}
                        />
                      </div>
                      <div className='space-y-2 md:col-span-2'>
                        <div className='flex justify-between items-center'>
                          <Label
                            htmlFor='signup-last-name'
                            className='text-white/90'>
                            {t('common.labels.lastName')}
                          </Label>
                          {errors.lastName && (
                            <span className='text-xs text-red-400'>
                              {errors.lastName}
                            </span>
                          )}
                        </div>
                        <Input
                          id='signup-last-name'
                          type='text'
                          placeholder={t('auth.placeholders.lastName')}
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${errors.lastName ? 'border-red-500' : ''
                            }`}
                        />
                      </div>

                      {/* Email Field */}
                      <div className='space-y-2 md:col-span-2'>
                        <Label htmlFor='signup-email' className='text-white/90'>{t('common.labels.email')}</Label>
                        <Input
                          id='signup-email'
                          placeholder={t('auth.placeholders.email')}
                          value={email}
                          onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })) }}
                          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className='text-xs text-red-400'>{errors.email}</p>}
                      </div>
                    </div>

                    {/* Role Field */}
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <Label htmlFor='signup-role' className='text-white/90'>
                          {t('auth.iAmA')}
                        </Label>
                        {errors.role && (
                          <span className='text-xs text-red-400'>
                            {errors.role}
                          </span>
                        )}
                      </div>
                      <Select
                        value={role}
                        onValueChange={(value: string) =>
                          setRole(value as UserRole)
                        }>
                        <SelectTrigger
                          className={`bg-white/10 border-white/20 text-white ${errors.role ? 'border-red-500' : ''
                            }`}>
                          <SelectValue placeholder={t('auth.placeholders.role')} />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          <SelectItem value={UserRole.ARTIST}>{tEnum(UserRole.ARTIST)}</SelectItem>
                          <SelectItem value={UserRole.RECRUITER}>
                            {tEnum(UserRole.RECRUITER)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mobile Field */}
                    <div className='space-y-2'>
                      <Label htmlFor='signup-mobile' className='text-white/90'>{t('common.labels.mobile')}</Label>
                      <Input
                        id='signup-mobile'
                        placeholder={t('auth.placeholders.mobile')}
                        value={mobile}
                        onChange={e => { setMobile(e.target.value); if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' })) }}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${errors.mobile ? 'border-red-500' : ''}`}
                      />
                      {errors.mobile && <p className='text-xs text-red-400'>{errors.mobile}</p>}
                    </div>

                    {/* Password Field - Full Width */}
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <Label
                          htmlFor='signup-password'
                          className='text-white/90'>
                          {t('common.labels.password')}
                        </Label>
                        {errors.password && (
                          <span className='text-xs text-red-400'>
                            {errors.password}
                          </span>
                        )}
                      </div>
                      <div className='relative'>
                        <Input
                          id='signup-password'
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.placeholders.createPassword')}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10 w-full ${errors.password ? 'border-red-500' : ''
                            }`}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-transparent'
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Confirm Password Field - Full Width */}
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <Label
                          htmlFor='confirm-password'
                          className='text-white/90'>
                          {t('common.labels.confirmPassword')}
                        </Label>
                        {errors.confirmPassword && (
                          <span className='text-xs text-red-400'>
                            {errors.confirmPassword}
                          </span>
                        )}
                      </div>
                      <div className='relative'>
                        <Input
                          id='confirm-password'
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('auth.placeholders.confirmPassword')}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 w-full pr-10 ${errors.confirmPassword ? 'border-red-500' : ''
                            }`}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-transparent'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Terms consent — Sign Up stays disabled until this is checked */}
                    <label
                      htmlFor='signup-terms'
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        acceptedTerms
                          ? 'border-orange-400/60 bg-orange-500/10'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}>
                      <Checkbox
                        id='signup-terms'
                        checked={acceptedTerms}
                        onCheckedChange={checked => setAcceptedTerms(checked === true)}
                        className='mt-0.5 border-white/60 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white'
                      />
                      <span className='text-sm leading-snug text-white/80'>
                        {t('auth.terms.before')}
                        {/* New tab, so the half-filled form isn't lost */}
                        <Link
                          to='/terms'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='font-semibold text-orange-300 underline-offset-2 hover:underline'>
                          {t('auth.terms.termsLink')}
                        </Link>
                        {t('auth.terms.middle')}
                        <Link
                          to='/privacy'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='font-semibold text-orange-300 underline-offset-2 hover:underline'>
                          {t('auth.terms.privacyLink')}
                        </Link>
                        {t('auth.terms.after')}
                      </span>
                    </label>
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition-all duration-300'
                    disabled={isLoading || !acceptedTerms}>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        {t('auth.creatingAccount')}
                      </>
                    ) : (
                      t('common.actions.signUp')
                    )}
                  </Button>
                  {!acceptedTerms && (
                    <p className='-mt-2 text-center text-xs text-white/50'>{t('auth.terms.hint')}</p>
                  )}
                  <div className='mt-6 pt-4 border-t border-white/10 text-center'>
                    <Link
                      to='/'
                      className='inline-flex items-center text-sm text-white/60 hover:text-white/90 transition-colors'>
                      <ArrowLeft className='h-3.5 w-3.5 mr-1.5' />
                      {t('auth.backToHome')}
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Social stats */}
            <div className='mt-6 pt-6 border-t border-white/20'>
              <p className='text-center text-white/60 text-sm mb-4'>
                {t('auth.community.title')}
              </p>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div className='flex flex-col items-center'>
                  <div className='w-10 h-10 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center mb-2'>
                    <Star className='h-5 w-5 text-orange-400' />
                  </div>
                  <span className='text-xs text-white/70'>{t('auth.community.artists')}</span>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='w-10 h-10 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full flex items-center justify-center mb-2'>
                    <Users className='h-5 w-5 text-amber-400' />
                  </div>
                  <span className='text-xs text-white/70'>{t('auth.community.recruiters')}</span>
                </div>
                <div className='flex flex-col items-center'>
                  <div className='w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-2'>
                    <Camera className='h-5 w-5 text-yellow-400' />
                  </div>
                  <span className='text-xs text-white/70'>{t('auth.community.auditions')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Auth
