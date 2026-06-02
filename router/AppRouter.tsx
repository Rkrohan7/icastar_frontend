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
import SuperAdminRecruitersPage from '@/pages/admin/SuperAdminRecruitersPage'
import SuperAdminArtistsPage from '@/pages/admin/SuperAdminArtistsPage'
import SuperAdminJobsPage from '@/pages/admin/SuperAdminJobsPage'
import SuperAdminReportsPage from '@/pages/admin/SuperAdminReportsPage'
import SuperAdminConfigPage from '@/pages/admin/SuperAdminConfigPage'
import AdminComingSoonPage from '@/pages/admin/AdminComingSoonPage'
import SuperAdminAdminUsersPage from '@/pages/admin/SuperAdminAdminUsersPage'
import SuperAdminAuditionsPage, { SuperAdminAuditionApprovalsPage } from '@/pages/admin/SuperAdminAuditionsPage'
import SuperAdminJobApprovalsPage from '@/pages/admin/SuperAdminJobApprovalsPage'
import SuperAdminCategoriesPage from '@/pages/admin/SuperAdminCategoriesPage'
import SuperAdminSkillsPage from '@/pages/admin/SuperAdminSkillsPage'
import SuperAdminJobApplicationsPage from '@/pages/admin/SuperAdminJobApplicationsPage'
import SuperAdminAuditionApplicationsPage from '@/pages/admin/SuperAdminAuditionApplicationsPage'
import SuperAdminInterviewsPage from '@/pages/admin/SuperAdminInterviewsPage'
import SuperAdminPortfolioPage from '@/pages/admin/SuperAdminPortfolioPage'
import SuperAdminReportContentPage from '@/pages/admin/SuperAdminReportContentPage'
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
        {
          path: '/admin/recruiters',
          element: <SuperAdminRecruitersPage />,
        },
        {
          path: '/admin/artists',
          element: <SuperAdminArtistsPage />,
        },
        {
          path: '/admin/jobs',
          element: <SuperAdminJobsPage />,
        },
        {
          path: '/admin/reports',
          element: <SuperAdminReportsPage />,
        },
        {
          path: '/admin/config',
          element: <SuperAdminConfigPage />,
        },
        {
          path: '/admin/users/admins',
          element: <SuperAdminAdminUsersPage />,
        },
        {
          path: '/admin/auditions/all',
          element: <SuperAdminAuditionsPage />,
        },
        {
          path: '/admin/auditions/approvals',
          element: <SuperAdminAuditionApprovalsPage />,
        },
        {
          path: '/admin/jobs/approvals',
          element: <SuperAdminJobApprovalsPage />,
        },
        {
          path: '/admin/jobs/categories',
          element: <SuperAdminCategoriesPage />,
        },
        {
          path: '/admin/settings/categories',
          element: <SuperAdminCategoriesPage />,
        },
        {
          path: '/admin/settings/skills',
          element: <SuperAdminSkillsPage />,
        },
        {
          path: '/admin/applications/jobs',
          element: <SuperAdminJobApplicationsPage />,
        },
        {
          path: '/admin/applications/auditions',
          element: <SuperAdminAuditionApplicationsPage />,
        },
        {
          path: '/admin/applications/interviews',
          element: <SuperAdminInterviewsPage />,
        },
        {
          path: '/admin/artists/:id/portfolio',
          element: <SuperAdminPortfolioPage />,
        },
        {
          path: '/admin/content/reports',
          element: <SuperAdminReportContentPage />,
        },
        // Redirect /admin to dashboard
        {
          path: '/admin',
          element: <Navigate to='/admin/dashboard' replace />,
        },
        // Catch-all for any /admin/* path not matched above.
        // Keeps the sidebar visible and shows a "Coming soon / API pending"
        // placeholder so the user can navigate through the full menu structure.
        {
          path: '/admin/*',
          element: <AdminComingSoonPage />,
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
