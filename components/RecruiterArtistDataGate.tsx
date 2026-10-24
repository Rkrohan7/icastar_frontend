import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getRecruiterProfile } from '@/services/recruiterProfileService'

type AccessState = 'loading' | 'allowed' | 'blocked' | 'error'

const RecruiterArtistDataGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const [state, setState] = useState<AccessState>('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    setState('loading')
    setError('')
    getRecruiterProfile(true)
      .then(profile => {
        if (!active) return
        setState(profile.isFaceVerified === true && profile.idProofVerified === true ? 'allowed' : 'blocked')
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Could not check recruiter verification.')
        setState('error')
      })
    return () => {
      active = false
    }
  }, [retry])

  if (state === 'allowed') return <>{children}</>
  if (state === 'loading') {
    return <div className='p-10 text-center text-sm text-gray-500'>Checking recruiter verification...</div>
  }

  return (
    <Dialog open onOpenChange={open => { if (!open) navigate('/profile') }}>
      <DialogContent className='bg-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{state === 'error' ? 'Unable to check verification' : 'Recruiter verification required'}</DialogTitle>
          <DialogDescription>
            {state === 'error'
              ? error
              : 'To view artist profiles and other artist information, your recruiter account must have both face verification and ID proof approved.'}
          </DialogDescription>
        </DialogHeader>
        {state === 'blocked' && (
          <div className='space-y-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-900'>
            <p>Complete both steps in your profile:</p>
            <ul className='list-inside list-disc'>
              <li>Submit your face photo and wait for approval.</li>
              <li>Submit your government ID proof and wait for approval.</li>
            </ul>
          </div>
        )}
        <DialogFooter>
          {state === 'error' && (
            <Button variant='secondary' onClick={() => setRetry(value => value + 1)}>Try again</Button>
          )}
          <Button onClick={() => navigate('/profile')}>Go to my profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RecruiterArtistDataGate
