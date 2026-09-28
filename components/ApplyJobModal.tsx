import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import applicationsService, { ApplicationRequest } from '@/services/applicationsService'
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
  const [coverLetter, setCoverLetter] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const salaryNum = Number(expectedSalary)
  const canSubmit = !!jobId && coverLetter.trim().length > 0 && !Number.isNaN(salaryNum) && salaryNum > 0

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
          <DialogTitle>{jobTitle ? t('applyJobModal.title', { title: jobTitle }) : t('applyJobModal.titleFallback')}</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  )
}

export default ApplyJobModal