import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import applicationsService, { ApplicationRequest } from '@/services/applicationsService'
import artistService from '@/services/artistService'
import artistDashboardService from '@/services/artistDashboardService'
import { toast } from 'react-toastify'
import { useTranslation } from '@/i18n'

interface ApplyJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: number | null
  jobTitle?: string
  onSubmitted?: () => void
}

const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  onSubmitted,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [coverLetter, setCoverLetter] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eligibility, setEligibility] = useState<{
    status: 'checking' | 'eligible' | 'blocked' | 'error'
    completion: number
    faceVerified: boolean
    idVerified: boolean
    error?: string
  }>({ status: 'checking', completion: 0, faceVerified: false, idVerified: false })
  const salaryNum = Number(expectedSalary)
  const canSubmit = eligibility.status === 'eligible' && !!jobId && coverLetter.trim().length > 0 && !Number.isNaN(salaryNum) && salaryNum > 0

  useEffect(() => {
    if (!open) return
    let active = true
    setEligibility({ status: 'checking', completion: 0, faceVerified: false, idVerified: false })
    setError(null)

    Promise.all([
      artistService.getMyProfile(true),
      artistDashboardService.getProfileCompletion(true),
    ]).then(([profile, completion]) => {
      if (!active) return
      if (!profile) throw new Error('Could not load your artist profile. Please try again.')
      const faceVerified = profile.isFaceVerified === true ||
        String(profile.faceVerificationStatus ?? '').toUpperCase() === 'APPROVED'
      const idVerified = profile.idProofVerified === true ||
        String(profile.idProofVerificationStatus ?? '').toUpperCase() === 'APPROVED'
      const profileCompletion = Number(completion.completionPercentage) || 0
      setEligibility({
        status: faceVerified && idVerified && profileCompletion >= 80 ? 'eligible' : 'blocked',
        completion: profileCompletion,
        faceVerified,
        idVerified,
      })
    }).catch((cause: unknown) => {
      if (!active) return
      setEligibility({
        status: 'error',
        completion: 0,
        faceVerified: false,
        idVerified: false,
        error: cause instanceof Error ? cause.message : 'Could not check your application requirements.',
      })
    })

    return () => {
      active = false
    }
  }, [open])

  const handleSubmit = async () => {
    if (!jobId) return

    // Basic client-side validation before submitting
    const trimmedCover = coverLetter.trim()
    const salary = Number(expectedSalary)
    if (trimmedCover.length < 10) {
      const msg = t('applyJobModal.validation.coverLetterTooShort')
      setError(msg)
      toast.error(msg)
      return
    }
    if (Number.isNaN(salary) || salary <= 0) {
      const msg = t('applyJobModal.validation.invalidSalary')
      setError(msg)
      toast.error(msg)
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const payload: ApplicationRequest = {
        coverLetter: trimmedCover,
        jobId: jobId,
        expectedSalary: salary,
      }
      await applicationsService.createApplication(payload)
      onOpenChange(false)
      setCoverLetter('')
      setExpectedSalary('')
      toast.success(jobTitle ? t('applyJobModal.toast.success', { title: jobTitle }) : t('applyJobModal.toast.successFallback'))
      if (onSubmitted) onSubmitted()
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || err?.response?.data?.error
      const message = backendMessage || err?.message || t('applyJobModal.toast.failed')
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] bg-white'>
        <DialogHeader>
          <DialogTitle>
            {eligibility.status === 'blocked'
              ? 'Application requirements not met'
              : eligibility.status === 'error'
                ? 'Could not check application requirements'
                : jobTitle ? t('applyJobModal.title', { title: jobTitle }) : t('applyJobModal.titleFallback')}
          </DialogTitle>
        </DialogHeader>

        {eligibility.status === 'checking' ? (
          <p className='py-6 text-center text-sm text-gray-500'>Checking your verification and profile completion...</p>
        ) : eligibility.status === 'error' ? (
          <div className='space-y-4'>
            <p className='text-sm text-red-700'>{eligibility.error}</p>
            <Button variant='secondary' onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : eligibility.status === 'blocked' ? (
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>To apply for a job, your face and ID proof must both be verified, and your profile must be at least 80% complete.</p>
            <ul className='space-y-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-900'>
              <li>{eligibility.faceVerified ? '✓' : '○'} Face verification approved</li>
              <li>{eligibility.idVerified ? '✓' : '○'} ID proof approved</li>
              <li>{eligibility.completion >= 80 ? '✓' : '○'} Profile completion: {eligibility.completion}% (required: 80%)</li>
            </ul>
            <DialogFooter>
              <Button variant='secondary' onClick={() => onOpenChange(false)}>Not now</Button>
              <Button onClick={() => { onOpenChange(false); navigate('/profile') }}>Complete my profile</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
        {error && (
          <div className='text-red-600 text-sm mb-2'>{error}</div>
        )}

        <div className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>{t('applyJobModal.coverLetter')}</label>
            <Textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder={t('applyJobModal.coverLetterPlaceholder')}
              rows={5}
            />
          </div>
          <div>
            <label className='text-sm font-medium'>{t('applyJobModal.expectedSalary')}</label>
            <Input
              type='number'
              step='0.01'
              value={expectedSalary}
              onChange={e => setExpectedSalary(e.target.value)}
              placeholder={t('applyJobModal.expectedSalaryPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter className='mt-4'>
          <Button variant='secondary' onClick={() => onOpenChange(false)} disabled={submitting}>{t('common.actions.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? t('common.actions.submitting') : t('common.actions.apply')}
          </Button>
        </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ApplyJobModal