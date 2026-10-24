import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import artistDashboardService from '@/services/artistDashboardService'
import { getProfileCompletionPopupEnabled } from '@/services/publicConfigService'
import { getRecruiterProfile } from '@/services/recruiterProfileService'

const ProfileCompletionReminder: React.FC = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    const role = String(localStorage.getItem('role') ?? '').toUpperCase()
    const loginSessionId = localStorage.getItem('loginSessionId') || `session-${Date.now()}`

    if (role !== 'ARTIST' && role !== 'RECRUITER') return
    if (localStorage.getItem('profileCompletionPopupDismissedSession') === loginSessionId) return

    const checkProfile = async () => {
      try {
        const enabled = await getProfileCompletionPopupEnabled()
        if (!active || !enabled) return

        const completion = role === 'ARTIST'
          ? (await artistDashboardService.getProfileCompletion(true)).completionPercentage
          : (await getRecruiterProfile(true)).profileCompletionPercentage

        if (!active) return
        if (typeof completion !== 'number' || !Number.isFinite(completion)) {
          throw new Error('Profile completion percentage is missing from the profile response.')
        }
        setOpen(completion < 100)
      } catch (error) {
        console.error('Failed to check profile completion reminder:', error)
      }
    }

    void checkProfile()
    return () => {
      active = false
    }
  }, [])

  const dismiss = () => {
    const loginSessionId = localStorage.getItem('loginSessionId')
    if (loginSessionId) {
      localStorage.setItem('profileCompletionPopupDismissedSession', loginSessionId)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={nextOpen => { if (!nextOpen) dismiss() }}>
      <DialogContent className='bg-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            Your profile is not complete yet. Add the remaining details to get the most out of iCastar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='secondary' onClick={dismiss}>Remind me next login</Button>
          <Button onClick={() => { dismiss(); navigate('/profile') }}>Complete profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileCompletionReminder
