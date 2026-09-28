import React, { useState, useEffect, useRef } from 'react'
import { Recruiter, Page } from '../types'
import {
  ChevronDownIcon,
  CogIcon,
  LogOutIcon,
  UserCircleIcon,
  MenuIcon,
} from './icons/IconComponents'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import userService from '@/services/userService'
import artistService from '@/services/artistService'
import { getRecruiterProfile } from '@/services/recruiterProfileService'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslation } from '@/i18n'
const initialRecruiterData: Recruiter = {
  name: 'Alex Morgan',
  title: 'Recruiter',
  email: 'alex.morgan@creativ.com',
  avatarUrl: 'https://picsum.photos/seed/recruiter/100/100',
  companyName: 'Creativ Inc.',
  companyWebsite: 'https://creativ.com',
  companyBio:
    "Creativ is a platform connecting the world's best artists with innovative companies. We believe in the power of creativity to drive progress.",
  verificationStatus: 'Verified',
  recruiterType: 'In-house',
}
interface HeaderProps {
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t, tEnum } = useTranslation()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [artistPhoto, setArtistPhoto] = useState<string | null>(null)
  const [recruiterPhoto, setRecruiterPhoto] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = userService.getStoredUser()
        if (stored) setUserProfile((prev: any) => prev || stored)

        const u = await userService.getCurrentUser()
        setUserProfile(u)

        const role = localStorage.getItem('role')
        if (role === 'ARTIST') {
          try {
            const artistProfile = await artistService.getMyProfile()
            if (artistProfile?.profilePhoto) setArtistPhoto(artistProfile.profilePhoto)
          } catch {}
        }
        if (role === 'RECRUITER') {
          try {
            const recruiterProfile = await getRecruiterProfile()
            if (recruiterProfile?.avatarUrl) setRecruiterPhoto(recruiterProfile.avatarUrl)
          } catch {}
        }
      } catch (e) {}
    }
    fetchUser()

    // Listen for photo update from RecruiterProfilePage
    const handlePhotoUpdate = (e: Event) => {
      const url = (e as CustomEvent<{ url: string }>).detail?.url
      if (url) setRecruiterPhoto(url)
    }
    window.addEventListener('recruiter-photo-updated', handlePhotoUpdate)
    return () => window.removeEventListener('recruiter-photo-updated', handlePhotoUpdate)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleNavigation = (page: Page) => {
    console.log(page)
    navigate(`/${page}`)
    setIsDropdownOpen(false)
  }

  // Name construction logic
  const firstName = userProfile?.firstName
  const lastName = userProfile?.lastName
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const displayName = fullName || userProfile?.email || t('header.fallbackUser')
  const displayRole: string | null = userProfile?.role || localStorage.getItem('role')
  const displayRoleFormatted = displayRole ? tEnum(displayRole.replace('ROLE_', '')) : t('header.fallbackUser')

  return (
    <header className='h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:justify-end lg:px-8 shrink-0'>
      <button
        onClick={onMenuClick}
        className='lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700'
        aria-label={t('header.openMenu')}>
        <MenuIcon className='h-6 w-6' />
      </button>
      <div className='flex items-center space-x-3 sm:space-x-5'>
        <LanguageSwitcher />
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className='flex items-center space-x-3 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors'
            aria-expanded={isDropdownOpen}
            aria-haspopup='true'>
            {recruiterPhoto || artistPhoto || userProfile?.avatarUrl || userProfile?.profilePicture ? (
              <img
                className='h-10 w-10 rounded-full object-cover'
                src={recruiterPhoto || artistPhoto || userProfile?.avatarUrl || userProfile?.profilePicture}
                alt={t('header.userAvatar')}
              />
            ) : (
              <div className='h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center'>
                <UserCircleIcon className='h-7 w-7 text-amber-500' />
              </div>
            )}
            <div className='hidden md:block text-left'>
              <p className='text-sm font-bold text-gray-800'>
                {displayName}
              </p>
              <p className='text-xs text-gray-500 font-medium'>{displayRoleFormatted}</p>
            </div>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 hidden md:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          {isDropdownOpen && (
            <div className='origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 focus:outline-none'>
              <div className='py-1'>
                <div className='px-4 py-3 border-b border-gray-100'>
                  <p className='text-sm font-semibold text-gray-900 leading-tight'>
                    {displayName}
                  </p>
                  <p className='text-xs text-gray-500 truncate mt-0.5'>
                    {userProfile?.email}
                  </p>
                </div>
                <button
                  onClick={() => handleNavigation(Page.Profile)}
                  className='flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100'>
                  <UserCircleIcon className='mr-3 h-5 w-5 text-gray-400' />
                  {t('common.nav.myProfile')}
                </button>
                <button
                  onClick={() => handleNavigation(Page.Settings)}
                  className='flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100'>
                  <CogIcon className='mr-3 h-5 w-5 text-gray-400' />
                  {t('common.nav.settings')}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    userService.logout();
                    toast.success(t('header.loggedOut'));
                    navigate('/auth');
                  }}
                  className='flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100 mt-1 pt-2'>
                  <LogOutIcon className='mr-3 h-5 w-5 text-gray-400' />
                  {t('common.actions.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
