import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Search, MapPin, Briefcase, Star, ChevronRight,
    CheckCircle, Play, Users, Camera, Music, Video, UserPlus, Send, Trophy, Calendar
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { getLandingStats, DEFAULT_LANDING_STATS, LandingStats } from '@/services/publicConfigService'
import blogService, { BlogPost } from '@/services/blogService'
import { useTranslation } from '@/i18n'

// --- Mock Data ---

// Display text lives in i18n/locales/landing.ts; these hold translation keys.
const POPULAR_ROLES = [
    { titleKey: 'landing.roles.actorActress', count: "2.3k+", labelKey: 'landing.roleCounts.openAuditions', icon: Star },
    { titleKey: 'landing.roles.voiceArtist', count: "1.2k+", labelKey: 'landing.roleCounts.opportunities', icon: Music },
    { titleKey: 'landing.roles.director', count: "450+", labelKey: 'landing.roleCounts.projects', icon: Video },
    { titleKey: 'landing.roles.choreographer', count: "800+", labelKey: 'landing.roleCounts.opportunities', icon: Users },
    { titleKey: 'landing.roles.musician', count: "1.1k+", labelKey: 'landing.roleCounts.auditions', icon: Music },
    { titleKey: 'landing.roles.model', count: "900+", labelKey: 'landing.roleCounts.projects', icon: Camera },
    { titleKey: 'landing.roles.scriptwriter', count: "350+", labelKey: 'landing.roleCounts.openings', icon: Briefcase },
    { titleKey: 'landing.roles.cinematographer', count: "200+", labelKey: 'landing.roleCounts.jobs', icon: Video },
    { titleKey: 'landing.roles.makeupArtist', count: "500+", labelKey: 'landing.roleCounts.opportunities', icon: Star },
    { titleKey: 'landing.roles.castingDirector', count: "100+", labelKey: 'landing.roleCounts.roles', icon: Users }
]

const TOP_ARTISTS = [
    {
        id: 101,
        name: 'RJ Komal',
        roleKey: 'landing.roles.anchor',
        locationKey: 'landing.places.naviMumbai',
        rating: 5.0,
        image: '/talent/rj-komal.png',
        completion: 100,
        verified: true
    },
    {
        id: 102,
        name: 'Sagar Sapkale',
        roleKey: 'landing.roles.musicDirector',
        locationKey: 'landing.places.mumbai',
        rating: 5.0,
        image: '/talent/sagar-sapkale.png',
        completion: 100,
        verified: true
    },
    {
        id: 103,
        name: 'Shivani Kulkarni',
        roleKey: 'landing.roles.singer',
        locationKey: 'landing.places.pune',
        rating: 5.0,
        image: '/talent/shivani-kulkarni.png',
        completion: 100,
        verified: true
    },
    {
        id: 104,
        name: 'Mohika Gadare',
        roleKey: 'landing.roles.actressModel',
        locationKey: 'landing.places.pune',
        rating: 5.0,
        image: '/talent/mohika-gadare.jpg',
        completion: 100,
        verified: true
    }
]

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Shivani Baokar',
        roleKey: 'landing.roles.actress',
        // Initials avatar — using a stock photo would misrepresent a real person.
        image: 'https://ui-avatars.com/api/?name=Shivani+Baokar&background=E36A3A&color=fff&size=128&bold=true',
        quoteKey: 'landing.testimonials.quotes.shivani'
    },
    {
        id: 2,
        name: 'Jeevan Bharati',
        roleKey: 'landing.roles.writerDirector',
        image: 'https://ui-avatars.com/api/?name=Jeevan+Bharati&background=E36A3A&color=fff&size=128&bold=true',
        quoteKey: 'landing.testimonials.quotes.jeevan'
    },
    {
        id: 3,
        name: 'Shailesh More',
        roleKey: 'landing.roles.makeupArtist',
        image: 'https://ui-avatars.com/api/?name=Shailesh+More&background=E36A3A&color=fff&size=128&bold=true',
        quoteKey: 'landing.testimonials.quotes.shailesh'
    }
]

// --- Hooks ---
function useCounter(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0)
    const countRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                let start = 0
                const stepTime = Math.abs(Math.floor(duration / end))
                const timer = setInterval(() => {
                    start += Math.ceil(end / 100)
                    if (start > end) start = end
                    setCount(start)
                    if (start === end) clearInterval(timer)
                }, stepTime)
                observer.disconnect()
            }
        }, { threshold: 0.5 })

        if (countRef.current) observer.observe(countRef.current)

        return () => observer.disconnect()
    }, [end, duration])

    return { count, countRef }
}


// --- Components ---

export const HeroSection = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    return (
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                    alt={t('landing.hero.backgroundAlt')}
                    className="w-full h-full object-cover opacity-40 animate-in zoom-in-150 duration-[20s] ease-linear"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
                {/* Creative Particles/Glows */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-600/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center mt-12 md:mt-0">
                <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/20 px-4 py-1 text-sm uppercase tracking-widest font-semibold backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {t('landing.hero.badge')}
                </Badge>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 drop-shadow-2xl">
                    {t('landing.hero.titleLine1')} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400 animate-gradient-x bg-[length:200%_auto]">
                        {t('landing.hero.titleLine2')}
                    </span>
                </h1>

                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 font-light leading-relaxed">
                    {t('landing.hero.subtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center animate-in fade-in zoom-in-50 duration-1000 delay-500">
                    <Button
                        size="lg"
                        className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-full shadow-lg hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300"
                        onClick={() => navigate('/auth')}
                    >
                        {t('landing.hero.cta')}
                    </Button>
                </div>
            </div>
        </section>
    )
}

// --- Jobs Data ---
const FEATURED_JOBS = [
    {
        id: 1,
        titleKey: 'landing.featured.jobs.j1.title',
        production: "Pentane Studios",
        locationKey: 'landing.places.mumbai',
        typeKey: 'landing.featured.types.audition',
        salary: "₹50k - ₹1L per day",
        tags: ["acting", "drama"],
        postedKey: 'landing.featured.jobs.j1.posted'
    },
    {
        id: 2,
        titleKey: 'landing.featured.jobs.j2.title',
        production: "Digital Cimble Media Services",
        locationKey: 'landing.places.delhi',
        typeKey: 'landing.featured.types.castingCall',
        salary: "₹25k - ₹40k",
        tags: ["modeling", "commercial"],
        postedKey: 'landing.featured.jobs.j2.posted'
    },
    {
        id: 3,
        titleKey: 'landing.featured.jobs.j3.title',
        production: "Shrihari Studios",
        locationKey: 'landing.places.remote',
        typeKey: 'landing.featured.types.project',
        salary: "₹10k - ₹15k per min",
        tags: ["voiceover", "kids"],
        postedKey: 'landing.featured.jobs.j3.posted'
    },
    {
        id: 4,
        titleKey: 'landing.featured.jobs.j4.title',
        production: "Creative Karkhana",
        locationKey: 'landing.places.bangalore',
        typeKey: 'landing.featured.types.job',
        salary: "₹2L - ₹3L Project",
        tags: ["music", "composition"],
        postedKey: 'landing.featured.jobs.j4.posted'
    }
]

export const SearchRolesSection = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    return (
        <section className="py-12 bg-white -mt-10 relative z-20">
            <div className="container mx-auto px-4">
                {/* Search Bar Container */}
                <div className="max-w-5xl mx-auto bg-white rounded-full shadow-2xl shadow-slate-200/50 border border-gray-100 p-2 mb-16 animate-in slide-in-from-bottom-8 duration-700 fade-in flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">

                    {/* Skills/Role Input */}
                    <div className="flex-1 px-6 py-3 flex items-center gap-3">
                        <Search className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('landing.search.roleLabel')}</label>
                            <Input
                                type="text"
                                placeholder={t('landing.search.rolePlaceholder')}
                                className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 text-gray-900 placeholder:text-gray-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* Experience Dropdown (Mock) */}
                    <div className="flex-1 px-6 py-3 flex items-center gap-3">
                        <Star className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('common.labels.experience')}</label>
                            <select className="w-full border-0 p-0 text-sm font-medium text-gray-900 focus:ring-0 bg-transparent outline-none cursor-pointer">
                                <option>{t('landing.search.experienceAny')}</option>
                                <option>{t('landing.search.experienceBeginner')}</option>
                                <option>{t('landing.search.experienceIntermediate')}</option>
                                <option>{t('landing.search.experienceExpert')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Location Input */}
                    <div className="flex-1 px-6 py-3 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 hidden md:block">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('common.labels.location')}</label>
                            <Input
                                type="text"
                                placeholder={t('landing.search.locationPlaceholder')}
                                className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 text-gray-900 placeholder:text-gray-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="p-2">
                        <Button
                            className="w-full md:w-auto h-full rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all font-sans text-base"
                            onClick={() => navigate('/auth')}
                        >
                            {t('landing.search.button')}
                        </Button>
                    </div>
                </div>

                {/* Featured Jobs Section */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{t('landing.featured.title')}</h3>
                            <p className="text-gray-500 text-sm">{t('landing.featured.subtitle')}</p>
                        </div>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold" onClick={() => navigate('/auth')}>
                            {t('landing.featured.seeAll')} <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURED_JOBS.map((job) => (
                            <Card
                                key={job.id}
                                className="p-5 hover:shadow-xl transition-shadow border-gray-100 cursor-pointer group hover:-translate-y-1 duration-300"
                                onClick={() => navigate('/auth')}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs">
                                        {job.production.substring(0, 2).toUpperCase()}
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">{t(job.typeKey)}</Badge>
                                </div>

                                <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{t(job.titleKey)}</h4>
                                <p className="text-sm text-gray-500 mb-4 font-medium">{job.production}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 rounded border border-gray-100">{t(`landing.tags.${tag}`)}</span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {t(job.locationKey)}</span>
                                    <span>{t(job.postedKey)}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Role Pills Grid */}
                <div className="max-w-6xl mx-auto">
                    <p className="text-center text-gray-500 mb-6 text-sm font-medium uppercase tracking-widest">{t('landing.featured.trendingCategories')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {POPULAR_ROLES.map((role, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className="rounded-full px-6 py-3 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 text-sm font-medium"
                                onClick={() => navigate('/auth')}
                            >
                                <role.icon className="w-4 h-4 mr-2 text-orange-500" />
                                {t(role.titleKey)}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export const PopularRolesSection = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="bg-[#FFF8F2] rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-visible">

                    {/* Text & Illustration Left */}
                    <div className="lg:w-1/3 space-y-6 relative z-10">
                        <div className="w-48 h-48 bg-gray-100 rounded-full mx-auto lg:mx-0 flex items-center justify-center mb-6">
                            <img
                                src="https://cdni.iconscout.com/illustration/premium/thumb/job-search-illustration-download-in-svg-png-gif-file-formats--online-business-hiring-pack-people-illustrations-3682977.png"
                                alt={t('landing.popular.illustrationAlt')}
                                className="w-40 h-40 object-contain mix-blend-multiply"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<svg class="w-20 h-20 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-4-8-8s4-8 8-8 8 4 8 8-4-8-8-8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
                                }}
                            />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 leading-tight text-center lg:text-left">
                            {t('landing.popular.titleLine1')} <br /> {t('landing.popular.titleLine2')}
                        </h2>
                        <p className="text-gray-600 text-lg text-center lg:text-left">
                            {t('landing.popular.description')}
                        </p>
                    </div>

                    {/* Role Cards Grid - Floating Card Style */}
                    <div className="lg:w-1/2 w-full">
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-orange-100/50 transform lg:scale-110 lg:-translate-x-12 relative z-20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {POPULAR_ROLES.map((role, idx) => (
                                    <div
                                        key={idx}
                                        className="group border border-gray-100 hover:border-orange-200 bg-white p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg flex items-center justify-between"
                                        onClick={() => navigate('/auth')}
                                    >
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-sm md:text-base">{t(role.titleKey)}</h4>
                                            <p className="text-gray-500 text-sm mt-1 font-medium">{t(role.labelKey, { value: role.count })}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Dots Simulator */}
                            <div className="flex justify-center gap-2 mt-6">
                                <div className="w-6 h-2 bg-slate-800 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const ChoosePathSection = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const paths = [
        { icon: Star, title: t('landing.roles.actor'), desc: t('landing.choosePath.descs.actor') },
        { icon: Music, title: t('landing.roles.musician'), desc: t('landing.choosePath.descs.musician') },
        { icon: Video, title: t('landing.roles.director'), desc: t('landing.choosePath.descs.director') },
        { icon: Briefcase, title: t('landing.roles.crew'), desc: t('landing.choosePath.descs.crew') }
    ]

    return (
        <section id="roles" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 animate-in slide-in-from-bottom-5 duration-700 fade-in">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing.choosePath.title')}</h2>
                    <p className="text-lg text-gray-600">{t('landing.choosePath.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {paths.map((path, idx) => (
                        <Card
                            key={idx}
                            className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border-transparent hover:border-amber-200 bg-white items-center flex flex-col text-center"
                            onClick={() => navigate('/auth')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-500 transition-colors duration-300 flex items-center justify-center mb-6">
                                <path.icon className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
                            <p className="text-sm text-gray-500 mb-6">{path.desc}</p>
                            <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-orange-600 font-medium flex items-center gap-1 text-sm">
                                {t('landing.choosePath.explore')} <ChevronRight className="w-4 h-4" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}



export const ArtistShowcaseSection = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    return (
        <section className="py-20 bg-white relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing.showcase.title')}</h2>
                        <p className="text-lg text-gray-600">{t('landing.showcase.subtitle')}</p>
                    </div>
                    <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => navigate('/auth')}>
                        {t('landing.showcase.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {TOP_ARTISTS.map((artist) => (
                        <div key={artist.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 cursor-pointer" onClick={() => navigate('/auth')}>
                            {/* Image Area */}
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={artist.image}
                                    alt={artist.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h4 className="text-xl font-bold flex items-center gap-2 mb-1">
                                        {artist.name}
                                        {artist.verified && <CheckCircle className="w-4 h-4 text-blue-400 fill-blue-400 bg-white rounded-full" />}
                                    </h4>
                                    <p className="text-sm text-white/90 font-medium">{t(artist.roleKey)}</p>
                                    <p className="text-xs text-white/70 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {t(artist.locationKey)}</p>
                                </div>
                            </div>
                            {/* Hover Overlay CTA */}
                            <div className="absolute inset-0 bg-orange-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                                <Button className="bg-white text-orange-600 hover:bg-gray-100 rounded-full font-bold">{t('common.actions.viewProfile')}</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const HowItWorksSection = () => {
    const { t } = useTranslation()
    const steps = [
        { icon: UserPlus, title: t('landing.howItWorks.steps.profile.title'), desc: t('landing.howItWorks.steps.profile.desc') },
        { icon: Send, title: t('landing.howItWorks.steps.connect.title'), desc: t('landing.howItWorks.steps.connect.desc') },
        { icon: Trophy, title: t('landing.howItWorks.steps.land.title'), desc: t('landing.howItWorks.steps.land.desc') }
    ]
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing.howItWorks.title')}</h2>
                    <p className="text-lg text-gray-600">{t('landing.howItWorks.subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 hidden md:block -z-0"></div>
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative z-10 bg-gray-50 p-4 rounded-xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: `${idx * 200}ms` }}>
                            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-6 border-4 border-white relative">
                                <step.icon className="w-8 h-8 text-orange-600" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed max-w-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- Events Data ---
const EVENTS = [
    {
        id: 1,
        titleKey: 'landing.events.items.e1.title',
        organizer: 'Drama School of Mumbai',
        typeKey: 'landing.events.types.workshop',
        tags: ['acting', 'technique'],
        dateKey: 'landing.events.items.e1.date',
        enrolled: 120,
        image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        closesInKey: 'landing.events.items.e1.closesIn'
    },
    {
        id: 2,
        titleKey: 'landing.events.items.e2.title',
        organizer: 'Voice Box Studio',
        typeKey: 'landing.events.types.webinar',
        tags: ['voiceover', 'career'],
        dateKey: 'landing.events.items.e2.date',
        enrolled: 450,
        image: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        closesInKey: 'landing.events.items.e2.closesIn'
    },
    {
        id: 3,
        titleKey: 'landing.events.items.e3.title',
        organizer: 'Casting Directors Guild',
        typeKey: 'landing.events.types.challenge',
        tags: ['audition', 'challenge'],
        dateKey: 'landing.events.items.e3.date',
        enrolled: 890,
        image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        closesInKey: 'landing.events.items.e3.closesIn'
    }
]

export const EventsSection = () => {
    const { t } = useTranslation()
    return (
        <section className="py-20 bg-white border-b border-gray-100 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">

                    {/* Left Side: Header & Illustration */}
                    <div className="lg:w-1/3 text-center lg:text-left flex flex-col items-center lg:items-start shrink-0">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {t('landing.events.titleLine1')} <br className="hidden lg:block" /> {t('landing.events.titleLine2')}
                        </h2>
                        <div className="relative w-64 h-64 bg-orange-50 rounded-full flex items-center justify-center mb-8">
                            {/* Abstract Illustration Placeholder */}
                            <img
                                src="https://img.freepik.com/free-vector/hand-drawn-business-people-illustration_52683-66806.jpg?w=740&t=st=1700000000~exp=1700000000~hmac=dummy" // Using a generic illustration style URL or fallback to icon 
                                alt={t('landing.events.illustrationAlt')}
                                className="w-56 h-56 object-contain opacity-90 mix-blend-multiply"
                                onError={(e) => {
                                    e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/747/747376.png" // Fallback icon
                                    e.currentTarget.className = "w-32 h-32 opacity-50"
                                }}
                            />
                        </div>
                        <p className="text-gray-600 text-lg max-w-xs mb-6">
                            {t('landing.events.description')}
                        </p>
                        <Button variant="link" className="text-orange-600 font-bold p-0 h-auto hover:text-orange-700">
                            {t('landing.events.seeAll')} <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    {/* Right Side: Horizontal Scroll Cards */}
                    <div className="lg:w-2/3 w-full overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide flex gap-6 snap-x snap-mandatory">
                        {EVENTS.map((event) => (
                            <Card key={event.id} className="min-w-[320px] max-w-[320px] snap-center shrink-0 border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden group bg-white rounded-2xl">
                                {/* Card Header Image */}
                                <div className="relative h-40 bg-gray-100">
                                    <img src={event.image} alt={t(event.titleKey)} className="w-full h-full object-cover" />
                                    <div className="absolute top-0 left-0 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-br-lg backdrop-blur-sm">
                                        {t('landing.events.entryClosesIn', { time: t(event.closesInKey) })}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        {t(event.typeKey)}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex flex-col h-[240px]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                                            {event.organizer.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700 truncate">{event.organizer}</div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-orange-600 transition-colors">
                                        {t(event.titleKey)}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                                                {t(`landing.tags.${tag}`)}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {t(event.dateKey)}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t('landing.events.enrolled', { count: event.enrolled })}</span>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold h-9 text-sm flex items-center justify-center gap-2">
                                        {t('landing.events.viewDetails')}
                                    </Button>
                                    <div className="mt-3 flex items-center gap-1 text-xs text-orange-600 font-medium">
                                        <Star className="w-3 h-3 fill-orange-600" /> {t('landing.events.learnFromExperts')}
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {/* 'View All' spacer card */}
                        <div className="min-w-[100px] flex items-center justify-center snap-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <ChevronRight />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const StatsSection = () => {
    const { t } = useTranslation()
    // Numbers come from Super Admin -> Config; defaults show until they load.
    const [stats, setStats] = useState<LandingStats>(DEFAULT_LANDING_STATS)

    useEffect(() => {
        let active = true
        getLandingStats().then(s => {
            if (active) setStats(s)
        })
        return () => {
            active = false
        }
    }, [])

    const StatItem = ({ end, label, color, percent = false }: { end: number, label: string, color: string, percent?: boolean }) => {
        const { count, countRef } = useCounter(end)
        return (
            <div className="text-center" ref={countRef}>
                <div className={`text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
                    {count.toLocaleString()}{percent ? "%" : "+"}
                </div>
                <p className="text-gray-500 font-medium uppercase tracking-wide text-sm">{label}</p>
            </div>
        )
    }

    // Admin can hide the whole section from Super Admin -> Config
    if (!stats.enabled) return null

    return (
        <section className="py-20 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    <StatItem end={stats.activeArtists} label={t('landing.stats.activeArtists')} color="from-orange-600 to-amber-500" />
                    <StatItem end={stats.castingDirectors} label={t('landing.stats.castingDirectors')} color="from-blue-600 to-purple-500" />
                    <StatItem end={stats.successfulAuditions} label={t('landing.stats.successfulAuditions')} color="from-green-600 to-emerald-500" />
                    <StatItem end={stats.successRate} label={t('landing.stats.successRate')} color="from-red-500 to-pink-500" percent />
                </div>
            </div>
        </section>
    )
}

export const BlogSection = () => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [blogs, setBlogs] = useState<BlogPost[]>([])
    const [enabled, setEnabled] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        // The admin can hide this section from Super Admin -> Config
        Promise.all([getLandingStats(), blogService.getPublicBlogs(3)])
            .then(([config, posts]) => {
                if (!active) return
                setEnabled(config.blogsEnabled)
                setBlogs(posts)
            })
            .catch(() => active && setBlogs([]))
            .finally(() => active && setLoading(false))
        return () => {
            active = false
        }
    }, [])

    // Nothing to show while loading, when switched off, or with no published posts
    if (loading || !enabled || blogs.length === 0) return null

    const formatDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
                    <div>
                        <h2 className="text-4xl font-bold mb-2">{t('landing.blog.title')}</h2>
                        <p className="text-xl text-gray-500">{t('landing.blog.subtitle')}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/blogs')}>
                        {t('landing.blog.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {blogs.map(blog => (
                        <Card
                            key={blog.id}
                            onClick={() => navigate(`/blogs/${blog.slug}`)}
                            className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border-gray-100 flex flex-col">
                            {blog.coverImageUrl ? (
                                <img src={blog.coverImageUrl} alt="" className="h-48 w-full object-cover" />
                            ) : (
                                <div className="h-48 w-full bg-gradient-to-br from-orange-100 to-amber-50" />
                            )}
                            <div className="p-6 flex flex-col flex-1">
                                {blog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {blog.tags.slice(0, 2).map(tag => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h3 className="text-lg font-bold mb-2">{blog.title}</h3>
                                {blog.excerpt && <p className="text-sm text-gray-500 line-clamp-3">{blog.excerpt}</p>}
                                <div className="mt-auto pt-4 text-xs text-gray-400">
                                    {[blog.authorName, formatDate(blog.publishedAt ?? blog.createdAt)].filter(Boolean).join(' · ')}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const TestimonialsSection = () => {
    const { t } = useTranslation()
    return (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">{t('landing.testimonials.title')}</h2>
                    <p className="text-xl text-slate-300">{t('landing.testimonials.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((item) => (
                        <div key={item.id} className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500" />
                                <div>
                                    <h4 className="font-bold text-white">{item.name}</h4>
                                    <p className="text-sm text-slate-400">{t(item.roleKey)}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed italic">"{t(item.quoteKey)}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const AboutSection = () => {
    const { t } = useTranslation()
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            {t('landing.about.title')}
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            {t('landing.about.intro')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                                <Star className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('landing.about.artist.title')}</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                {t('landing.about.artist.p1')}
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                {t('landing.about.artist.p2Before')}<span className="font-semibold text-orange-600">{t('landing.about.artist.flash')}</span>{t('landing.about.artist.p2Middle')}<span className="font-semibold text-orange-600">{t('landing.about.artist.spotlight')}</span>{t('landing.about.artist.p2After')}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('landing.about.casting.title')}</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {t('landing.about.casting.text')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-10 rounded-2xl border border-gray-200">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">{t('landing.about.community.title')}</h3>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Music className="h-8 w-8 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900">{t('landing.about.community.artists.title')}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {t('landing.about.community.artists.text')}
                                </p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Video className="h-8 w-8 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900">{t('landing.about.community.film.title')}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {t('landing.about.community.film.text')}
                                </p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-green-600" />
                                </div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900">{t('landing.about.community.events.title')}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {t('landing.about.community.events.text')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            {t('landing.about.closing')}
                        </p>
                        <p className="text-gray-700 font-medium">
                            {t('landing.about.moreInfo')}{' '}
                            <a
                                href="mailto:admin.icastar@gmail.com"
                                onClick={(e) => {
                                    e.preventDefault()
                                    window.open(
                                        'https://mail.google.com/mail/?view=cm&fs=1&to=admin.icastar@gmail.com&su=Support%20Request%20-%20iCastar',
                                        '_blank',
                                        'noopener,noreferrer',
                                    )
                                }}
                                className="text-orange-600 hover:text-orange-700 underline">
                                admin.icastar@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const FAQSection = () => {
    const { t } = useTranslation()
    const [openFAQ, setOpenFAQ] = useState<number | null>(null)

    const faqs = [
        {
            id: 1,
            question: t('landing.faq.q1.question'),
            answer: {
                artist: t('landing.faq.q1.artist'),
                recruiter: t('landing.faq.q1.recruiter')
            }
        },
        {
            id: 2,
            question: t('landing.faq.q2.question'),
            answer: {
                main: t('landing.faq.q2.main')
            }
        },
        {
            id: 3,
            question: t('landing.faq.q3.question'),
            answer: {
                main: t('landing.faq.q3.main'),
                steps: [
                    t('landing.faq.q3.steps.s1'),
                    t('landing.faq.q3.steps.s2'),
                    t('landing.faq.q3.steps.s3')
                ]
            }
        },
        {
            id: 4,
            question: t('landing.faq.q4.question'),
            answer: {
                main: t('landing.faq.q4.main'),
                details: t('landing.faq.q4.details')
            }
        },
        {
            id: 5,
            question: t('landing.faq.q5.question'),
            answer: {
                main: t('landing.faq.q5.main'),
                categories: [
                    {
                        title: t('landing.faq.q5.categories.artists.title'),
                        desc: t('landing.faq.q5.categories.artists.desc')
                    },
                    {
                        title: t('landing.faq.q5.categories.professionals.title'),
                        desc: t('landing.faq.q5.categories.professionals.desc')
                    },
                    {
                        title: t('landing.faq.q5.categories.individuals.title'),
                        desc: t('landing.faq.q5.categories.individuals.desc')
                    }
                ]
            }
        },
        {
            id: 6,
            question: t('landing.faq.q6.question'),
            answer: {
                main: t('landing.faq.q6.main')
            }
        }
    ]

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            {t('landing.faq.title')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('landing.faq.subtitle')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <button
                                    onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-lg text-gray-900 pr-8">
                                        {faq.question}
                                    </span>
                                    <ChevronRight
                                        className={`h-6 w-6 text-orange-600 flex-shrink-0 transition-transform ${openFAQ === faq.id ? 'rotate-90' : ''
                                            }`}
                                    />
                                </button>

                                {openFAQ === faq.id && (
                                    <div className="px-8 pb-6 text-gray-700 leading-relaxed">
                                        {faq.answer.artist && (
                                            <div className="mb-4">
                                                <p className="font-semibold text-orange-600 mb-2">{t('landing.faq.forArtist')}</p>
                                                <p>{faq.answer.artist}</p>
                                            </div>
                                        )}
                                        {faq.answer.recruiter && (
                                            <div className="mb-4">
                                                <p className="font-semibold text-blue-600 mb-2">{t('landing.faq.forRecruiters')}</p>
                                                <p>{faq.answer.recruiter}</p>
                                            </div>
                                        )}
                                        {faq.answer.main && (
                                            <p className="mb-4">{faq.answer.main}</p>
                                        )}
                                        {faq.answer.steps && (
                                            <ol className="list-decimal list-inside space-y-2 ml-4">
                                                {faq.answer.steps.map((step, index) => (
                                                    <li key={index}>{step}</li>
                                                ))}
                                            </ol>
                                        )}
                                        {faq.answer.details && (
                                            <p className="mt-4 text-gray-600">{faq.answer.details}</p>
                                        )}
                                        {faq.answer.categories && (
                                            <div className="space-y-4 mt-4">
                                                {faq.answer.categories.map((cat, index) => (
                                                    <div key={index}>
                                                        <p className="font-semibold text-gray-900 mb-1">{cat.title}:</p>
                                                        <p className="text-gray-600">{cat.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center p-8 bg-orange-50 rounded-2xl border border-orange-200">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('landing.faq.moreQuestions.title')}</h3>
                        <p className="text-gray-700 mb-4">
                            {t('landing.faq.moreQuestions.text')}
                        </p>
                        <a
                            href="mailto:admin.icastar@gmail.com"
                            onClick={(e) => {
                                // A bare mailto: does nothing when the browser has no default
                                // mail app registered (common on desktop Chrome). Open Gmail's
                                // web compose in a new tab so the click always does something;
                                // the mailto href still serves right-click / native-client users.
                                e.preventDefault()
                                window.open(
                                    'https://mail.google.com/mail/?view=cm&fs=1&to=admin.icastar@gmail.com&su=Support%20Request%20-%20iCastar',
                                    '_blank',
                                    'noopener,noreferrer',
                                )
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                        >
                            <Send className="h-5 w-5" />
                            {t('landing.faq.moreQuestions.emailUs', { email: 'admin.icastar@gmail.com' })}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
