import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicArtistProfile } from '@/services/publicArtistService'
import { ArtistProfile } from '@/services/artistService'
import { useTranslation } from '@/i18n'

// ── Helpers ──────────────────────────────────────────────────────────────────

const toArr = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val.map(String).filter(Boolean)
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p.map(String) : [val] } catch { return [val] }
  }
  return []
}

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${color}`}>{label}</span>
)

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h4 className="text-base font-semibold text-gray-800 mb-4">{title}</h4>
    {children}
  </div>
)

const InfoGrid: React.FC<{ items: { label: string; value: string | number | boolean }[] }> = ({ items }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {items.map(({ label, value }) => (
      <div key={label}>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 capitalize">{String(value)}</p>
      </div>
    ))}
  </div>
)

// ── Loading Skeleton ──────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
)

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
      <Skeleton className="h-8 w-28 rounded-lg" />
      <Skeleton className="h-9 w-32 rounded-lg" />
    </nav>
    <Skeleton className="w-full h-48" />
    <div className="max-w-5xl mx-auto px-4 -mt-12 pb-16">
      <div className="flex items-end gap-5 mb-8">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="space-y-2 pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-28" />
        </div>
      </div>
    </div>
  </div>
)

// ── Not Found ─────────────────────────────────────────────────────────────────

const NotFound = () => {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <img src="/favicon.png" alt="iCastar" className="h-14 w-14 mb-6 opacity-60" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('publicArtistProfile.notFound.title')}</h2>
      <p className="text-gray-500 mb-6">{t('publicArtistProfile.notFound.message')}</p>
      <a
        href="https://www.icastar.com"
        className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors"
      >
        {t('publicArtistProfile.goToICastar')}
      </a>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export const PublicArtistProfilePage: React.FC = () => {
  const { t, tEnum } = useTranslation()
  const { userId } = useParams<{ userId: string }>()
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!userId) { setError(true); setLoading(false); return }

    getPublicArtistProfile(userId)
      .then(p => {
        setProfile(p)
        const meta = document.querySelector('meta[name="description"]')
        if (meta && p.bio) meta.setAttribute('content', p.bio)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [userId])

  // Kept separate from the fetch so the tab title follows language changes.
  useEffect(() => {
    if (!profile) return
    const name = profile.stageName || profile.fullName || t('publicArtistProfile.artistFallback')
    document.title = t('publicArtistProfile.documentTitle', { name })
  }, [profile, t])

  if (loading) return <LoadingSkeleton />
  if (error || !profile) return <NotFound />

  const skills = toArr(profile.skills)
  const langs = toArr(profile.languages ?? profile.languagesSpoken)
  const areas = toArr(profile.comfortableAreas)
  const cities = toArr(profile.travelCities)
  const portfolio = toArr(profile.portfolioUrls)

  const displayName = profile.stageName || profile.fullName || t('publicArtistProfile.artistFallback')
  const professionNames = (profile.professions && profile.professions.length > 0)
    ? profile.professions.map(p =>
      p.experienceYears != null && p.experienceYears > 0
        ? t('publicArtistProfile.professionWithYears', { name: p.displayName, count: p.experienceYears })
        : p.displayName,
    )
    : [profile.artistType?.displayName ?? profile.category ?? t('publicArtistProfile.artistFallback')]
  const category = professionNames.join(' · ')

  const overviewItems = [
    profile.location && { label: t('common.labels.location'), value: profile.location },
    profile.experienceYears != null && { label: t('common.labels.experience'), value: t('common.units.yearsShort', { count: profile.experienceYears }) },
    profile.gender && { label: t('common.labels.gender'), value: tEnum(profile.gender) },
    profile.dateOfBirth && { label: t('publicArtistProfile.overview.dateOfBirth'), value: profile.dateOfBirth },
    profile.maritalStatus && { label: t('publicArtistProfile.overview.maritalStatus'), value: tEnum(profile.maritalStatus) },
    profile.hourlyRate != null && { label: t('publicArtistProfile.overview.perDay'), value: `₹ ${profile.hourlyRate.toLocaleString('en-IN')}` },
    profile.hasPassport !== undefined && { label: t('publicArtistProfile.overview.passport'), value: profile.hasPassport ? t('common.actions.yes') : t('common.actions.no') },
  ].filter(Boolean) as { label: string; value: string | number | boolean }[]

  const physicalItems = [
    profile.height && { label: t('publicArtistProfile.physical.height'), value: profile.height },
    profile.weight != null && { label: t('publicArtistProfile.physical.weight'), value: t('publicArtistProfile.physical.weightValue', { value: profile.weight }) },
    profile.hairColor && { label: t('publicArtistProfile.physical.hairColor'), value: profile.hairColor },
    profile.hairLength && { label: t('publicArtistProfile.physical.hairLength'), value: profile.hairLength },
    profile.eyeColor && { label: t('publicArtistProfile.physical.eyeColor'), value: profile.eyeColor },
    profile.complexion && { label: t('publicArtistProfile.physical.complexion'), value: profile.complexion },
    profile.shoeSize && { label: t('publicArtistProfile.physical.shoeSize'), value: profile.shoeSize },
    profile.hasTattoo !== undefined && { label: t('publicArtistProfile.physical.tattoo'), value: profile.hasTattoo ? t('common.actions.yes') : t('common.actions.no') },
    profile.hasMole !== undefined && { label: t('publicArtistProfile.physical.mole'), value: profile.hasMole ? t('common.actions.yes') : t('common.actions.no') },
  ].filter(Boolean) as { label: string; value: string | number | boolean }[]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Top Nav ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-3 flex items-center justify-between shadow-sm">
        <a href="https://www.icastar.com" className="flex items-center gap-2">
          <img src="/favicon.png" alt="iCastar" className="h-8 w-8 rounded-lg" />
          <span className="font-bold text-gray-900 text-lg">iCastar</span>
        </a>
        <a
          href="https://www.icastar.com/auth"
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
        >
          {t('publicArtistProfile.joinICastar')}
        </a>
      </nav>

      {/* ── Cover Photo ── */}
      {profile.coverPhoto ? (
        <img src={profile.coverPhoto} alt={t('publicArtistProfile.coverAlt')} className="w-full h-52 object-cover" />
      ) : (
        <div className="w-full h-52 bg-gradient-to-br from-primary/30 via-amber-200/40 to-primary/10" />
      )}

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-8">
          <img
            src={profile.profilePhoto || `https://picsum.photos/seed/${userId}/200/200`}
            alt={displayName}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md shrink-0"
          />
          <div className="pb-1">
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {profile.isVerifiedBadge && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('publicArtistProfile.verified')}
                </span>
              )}
            </div>
            <p className="text-primary font-semibold text-sm mt-0.5">{category}</p>
            {profile.location && (
              <p className="text-gray-500 text-sm mt-0.5">📍 {profile.location}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Bio */}
            {profile.bio && (
              <Section title={t('publicArtistProfile.sections.about')}>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </Section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <Section title={t('common.labels.skills')}>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => <Badge key={s} label={s} color="bg-orange-50 text-orange-700" />)}
                </div>
              </Section>
            )}

            {/* Overview */}
            {overviewItems.length > 0 && (
              <Section title={t('publicArtistProfile.sections.overview')}>
                <InfoGrid items={overviewItems} />
              </Section>
            )}

            {/* Physical Attributes */}
            {physicalItems.length > 0 && (
              <Section title={t('publicArtistProfile.sections.physicalAttributes')}>
                <InfoGrid items={physicalItems} />
              </Section>
            )}

            {/* Languages */}
            {langs.length > 0 && (
              <Section title={t('common.labels.languages')}>
                <div className="flex flex-wrap gap-2">
                  {langs.map(l => <Badge key={l} label={l} color="bg-blue-50 text-blue-700" />)}
                </div>
              </Section>
            )}

            {/* Comfortable Areas */}
            {areas.length > 0 && (
              <Section title={t('publicArtistProfile.sections.comfortableAreas')}>
                <div className="flex flex-wrap gap-2">
                  {areas.map(a => <Badge key={a} label={a} color="bg-green-50 text-green-700" />)}
                </div>
              </Section>
            )}

            {/* Travel Cities */}
            {cities.length > 0 && (
              <Section title={t('publicArtistProfile.sections.willingToTravel')}>
                <div className="flex flex-wrap gap-2">
                  {cities.map(c => <Badge key={c} label={c} color="bg-purple-50 text-purple-700" />)}
                </div>
              </Section>
            )}

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <Section title={t('publicArtistProfile.sections.portfolio')}>
                <ul className="space-y-2">
                  {portfolio.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {url.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Video */}
            {(profile.videoUrl || profile.danceVideo) && (
              <Section title={t('publicArtistProfile.sections.video')}>
                <video
                  src={profile.videoUrl || profile.danceVideo}
                  controls
                  className="w-full rounded-xl max-h-72 bg-black"
                />
              </Section>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-5">

            {/* Contact */}
            {(profile.email || profile.phone) && (
              <Section title={t('publicArtistProfile.sections.contact')}>
                <ul className="space-y-3 text-sm">
                  {profile.email && (
                    <li className="flex items-center gap-3">
                      <span className="text-gray-400">✉️</span>
                      <a href={`mailto:${profile.email}`} className="text-primary hover:underline truncate">
                        {profile.email}
                      </a>
                    </li>
                  )}
                  {profile.phone && (
                    <li className="flex items-center gap-3">
                      <span className="text-gray-400">📞</span>
                      <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
                        {profile.phone}
                      </a>
                    </li>
                  )}
                </ul>
              </Section>
            )}

            {/* iCastar CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-amber-50 rounded-2xl p-5 border border-primary/20 text-center">
              <img src="/favicon.png" alt="iCastar" className="h-10 w-10 rounded-xl mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-800 mb-1">{t('publicArtistProfile.cta.title')}</p>
              <p className="text-xs text-gray-500 mb-4">{t('publicArtistProfile.cta.subtitle')}</p>
              <a
                href="https://www.icastar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
              >
                {t('publicArtistProfile.cta.explore')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img src="/favicon.png" alt="iCastar" className="h-5 w-5 rounded" />
          <span className="text-sm font-semibold text-gray-700">iCastar</span>
        </div>
        <p className="text-xs text-gray-400">{t('common.tagline')} · <a href="https://www.icastar.com" className="hover:underline text-primary">www.icastar.com</a></p>
      </footer>
    </div>
  )
}

export default PublicArtistProfilePage
