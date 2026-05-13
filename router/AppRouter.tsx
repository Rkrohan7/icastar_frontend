import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import AuthPage from '@/pages/auth/AuthPage'
import Auth from '@/pages/auth/Auth'
import TermsAndConditionsPage from '@/pages/auth/TermsAndConditionsPage'
import PrivacyPolicyPage from '@/pages/auth/PrivacyPolicyPage'
import DashLayout from '@/layouts/DashLayout'
import AdminLayout from '@/layouts/AdminLayout'
import { PostJobPage } from '@/pages/recruiter/PostJobPage'
import { BrowseArtistsPage } from '@/pages/recruiter/BrowseArtistsPage'
import CandidatesPage from '@/pages/recruiter/CandidatesPage'
import { PastHiresPage } from '@/pages/recruiter/PastHiresPage'
import { ApplicantProfilePage } from '@/pages/recruiter/ApplicantProfilePage'
import { ApplicantsPage } from '@/pages/recruiter/ApplicantsPage'
import { ArtistProfilePage } from '@/pages/recruiter/ArtistProfilePage'
import { PastHireDetailPage } from '@/pages/recruiter/PastHireDetailPage'
import { NotificationsPage } from '@/pages/recruiter/NotificationsPage'
import { SettingsPage } from '@/pages/recruiter/SettingsPage'
import AuditionsListPage from '@/pages/recruiter/AuditionsListPage'
import CreateAuditionPage from '@/pages/recruiter/CreateAuditionPage'
import AuditionApplicationsPage from '@/pages/recruiter/AuditionApplicationsPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import DashboardIndex from '@/pages/DashboardIndex'
import Jobs from '@/pages/artist/Jobs'
import Bookmarks from '@/pages/artist/Bookmarks'
import Auditions from '@/pages/artist/Auditions'
import Applications from '@/pages/artist/Applications'
import Messages from '@/pages/artist/Messages'
import ProfileIndex from '@/pages/ProfileIndex'
import ArtistRegistrationForm from '@/pages/artist/ArtistRegistrationForm'
// import PublicArtistProfilePage from '@/pages/public/PublicArtistProfilePage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

const AppRouter = () =>
  createBrowserRouter([
    // Auth routes (public)
    {
      element: <AuthLayout />,
      children: [
        {
          path: '/',
          element: <AuthPage />,
        },
        {
          path: '/auth',
          element: <Auth />,
        },
        {
          path: '/onboarding',
          element: <ArtistRegistrationForm />,
        },
        {
          path: '/terms',
          element: <TermsAndConditionsPage />,
        },
        {
          path: '/privacy',
          element: <PrivacyPolicyPage />,
        },
        {
          path: '/forgot-password',
          element: <ForgotPasswordPage />,
        },
        {
          path: '/reset-password',
          element: <ResetPasswordPage />,
        },
        // {
        //   path: '/:userId/profile',
        //   element: <PublicArtistProfilePage />,
        // },
      ],
    },
    // Protected routes (dashboard)
    {
      element: <DashLayout />,
      children: [
        {
          path: '/dashboard',
          element: <DashboardIndex />,
        },
        {
          path: '/my-jobs',
          element: <PostJobPage />,
        },
        {
          path: '/jobs',
          element: <Jobs />,
        },
        {
          path: '/bookmarks',
          element: <Bookmarks />,
        },
        {
          path: '/auditions',
          element: <Auditions />,
        },
        {
          path: '/applications',
          element: <Applications />,
        },
        {
          path: '/messages',
          element: <Messages />,
        },
        {
          path: '/artists',
          element: <BrowseArtistsPage />,
        },
        {
          path: '/candidates',
          element: <CandidatesPage />,
        },
        {
          path: '/hires',
          element: <PastHiresPage />,
        },
        {
          path: '/applicant-profile',
          element: <ApplicantProfilePage />,
        },
        {
          path: '/applicants',
          element: <ApplicantsPage />,
        },
        {
          path: '/artist-profile',
          element: <ArtistProfilePage />,
        },
        {
          path: '/past-hires',
          element: <PastHireDetailPage />,
        },
        {
          path: '/notifications',
          element: <NotificationsPage />,
        },
        {
          path: '/profile',
          element: <ProfileIndex />,
        },
        {
          path: '/settings',
          element: <SettingsPage />,
        },
        // Recruiter Audition Routes
        {
          path: '/recruiter/auditions',
          element: <AuditionsListPage />,
        },
        {
          path: '/recruiter/auditions/create',
          element: <CreateAuditionPage />,
        },
        {
          path: '/recruiter/auditions/:auditionId/edit',
          element: <CreateAuditionPage />,
        },
        {
          path: '/recruiter/auditions/:auditionId/applications',
          element: <AuditionApplicationsPage />,
        },
      ],
    },
    // Admin routes (protected)
    {
      element: <AdminLayout />,
      children: [
        {
          path: '/admin/dashboard',
          element: <AdminDashboardPage />,
        },
        // Redirect /admin to dashboard
        {
          path: '/admin',
          element: <Navigate to='/admin/dashboard' replace />,
        },
      ],
    },
    // Catch-all route
    {
      path: '*',
      element: <Navigate to='/' replace />,
    },
  ])

export default AppRouter
