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

// --- Mock Data ---

const POPULAR_ROLES = [
    { title: "Actor / Actress", count: "2.3k+", label: "Open Auditions", icon: Star },
    { title: "Voice Artist", count: "1.2k+", label: "Opportunities", icon: Music },
    { title: "Director", count: "450+", label: "Projects", icon: Video },
    { title: "Choreographer", count: "800+", label: "Opportunities", icon: Users },
    { title: "Musician", count: "1.1k+", label: "Auditions", icon: Music },
    { title: "Model", count: "900+", label: "Projects", icon: Camera },
    { title: "Scriptwriter", count: "350+", label: "Openings", icon: Briefcase },
    { title: "Cinematographer", count: "200+", label: "Jobs", icon: Video },
    { title: "Makeup Artist", count: "500+", label: "Opportunities", icon: Star },
    { title: "Casting Director", count: "100+", label: "Roles", icon: Users }
]

const TOP_ARTISTS = [
    {
        id: 101,
        name: 'RJ Komal',
        role: 'Anchor',
        location: 'Navi Mumbai',
        rating: 5.0,
        image: '/talent/rj-komal.png',
        completion: 100,
        verified: true
    },
    {
        id: 102,
        name: 'Sagar Sapkale',
        role: 'Music Director',
        location: 'Mumbai',
        rating: 5.0,
        image: '/talent/sagar-sapkale.png',
        completion: 100,
        verified: true
    },
    {
        id: 103,
        name: 'Shivani Kulkarni',
        role: 'Singer',
        location: 'Pune',
        rating: 5.0,
        image: '/talent/shivani-kulkarni.png',
        completion: 100,
        verified: true
    },
    {
        id: 104,
        name: 'Mohika Gadare',
        role: 'Actress / Model',
        location: 'Pune',
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
        role: 'Actress',
        // Initials avatar — using a stock photo would misrepresent a real person.
        image: 'https://ui-avatars.com/api/?name=Shivani+Baokar&background=E36A3A&color=fff&size=128&bold=true',
        quote: "As an artist, getting the right opportunities and reaching the right audience is crucial. iCastar is a great concept that brings artists, casting directors, and production houses together on a single platform. iCastar's effort to provide a proper platform for talent—especially for upcoming and rural artists—is truly commendable. I feel every artist should connect with iCastar through their profile and talent."
    },
    {
        id: 2,
        name: 'Jeevan Bharati',
        role: 'Writer & Director',
        image: 'https://ui-avatars.com/api/?name=Jeevan+Bharati&background=E36A3A&color=fff&size=128&bold=true',
        quote: "Finding local artists while shooting at various locations is always a challenging task. iCastar has made this job very simple. I have personally selected artists through iCastar, and the experience was great. The platform is easy to use and can certainly be useful for the entire entertainment industry. Here, you can hire not just actors, but also writers, directors, and other industry professionals. iCastar's initiative to connect artists and industry professionals on a single platform is truly commendable."
    },
    {
        id: 3,
        name: 'Shailesh More',
        role: 'Makeup Artist',
        image: 'https://ui-avatars.com/api/?name=Shailesh+More&background=E36A3A&color=fff&size=128&bold=true',
        quote: "There are plenty of opportunities for makeup artists, but relying solely on personal references and contacts isn't enough to find them. If you want access to more work, registering on iCastar is a must—I personally prefer iCastar too."
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
    return (
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                    alt="Film Set and Casting Background"
                    className="w-full h-full object-cover opacity-40 animate-in zoom-in-150 duration-[20s] ease-linear"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40"></div>
                {/* Creative Particles/Glows */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-600/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center mt-12 md:mt-0">
                <Badge className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/20 px-4 py-1 text-sm uppercase tracking-widest font-semibold backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    The #1 Artist Job Portal
                </Badge>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 drop-shadow-2xl">
                    Find Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-orange-400 animate-gradient-x bg-[length:200%_auto]">
                        Dream Role Now
                    </span>
                </h1>

                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 font-light leading-relaxed">
                    Thousands of auditions and projects waiting for you
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center animate-in fade-in zoom-in-50 duration-1000 delay-500">
                    <Button
                        size="lg"
                        className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-full shadow-lg hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300"
                        onClick={() => navigate('/auth')}
                    >
                        Explore Opportunities
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
        title: "Lead Actor for Web Series",
        production: "Netflix Originals",
        location: "Mumbai",
        type: "Audition",
        salary: "₹50k - ₹1L per day",
        tags: ["Acting", "Drama"],
        posted: "2d ago"
    },
    {
        id: 2,
        title: "Female Model for TVC",
        production: "Lakme Fashion",
        location: "Delhi",
        type: "Casting Call",
        salary: "₹25k - ₹40k",
        tags: ["Modeling", "Commercial"],
        posted: "5h ago"
    },
    {
        id: 3,
        title: "Voice Artist for Animation",
        production: "Green Gold TV",
        location: "Remote",
        type: "Project",
        salary: "₹10k - ₹15k per min",
        tags: ["Voiceover", "Kids"],
        posted: "1d ago"
    },
    {
        id: 4,
        title: "Music Composer needed",
        production: "Indie Film Studio",
        location: "Bangalore",
        type: "Job",
        salary: "₹2L - ₹3L Project",
        tags: ["Music", "Composition"],
        posted: "3d ago"
    }
]

export const SearchRolesSection = () => {
    const navigate = useNavigate()
    return (
        <section className="py-12 bg-white -mt-10 relative z-20">
            <div className="container mx-auto px-4">
                {/* Search Bar Container */}
                <div className="max-w-5xl mx-auto bg-white rounded-full shadow-2xl shadow-slate-200/50 border border-gray-100 p-2 mb-16 animate-in slide-in-from-bottom-8 duration-700 fade-in flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">

                    {/* Skills/Role Input */}
                    <div className="flex-1 px-6 py-3 flex items-center gap-3">
                        <Search className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role / Talent</label>
                            <Input
                                type="text"
                                placeholder="Actor, Model, Voice Artist..."
                                className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 text-gray-900 placeholder:text-gray-300 font-medium"
                            />
                        </div>
                    </div>

                    {/* Experience Dropdown (Mock) */}
                    <div className="flex-1 px-6 py-3 flex items-center gap-3">
                        <Star className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experience</label>
                            <select className="w-full border-0 p-0 text-sm font-medium text-gray-900 focus:ring-0 bg-transparent outline-none cursor-pointer">
                                <option>Any Experience</option>
                                <option>Beginner (0-2 yrs)</option>
                                <option>Intermediate (2-5 yrs)</option>
                                <option>Expert (5+ yrs)</option>
                            </select>
                        </div>
                    </div>

                    {/* Location Input */}
                    <div className="flex-1 px-6 py-3 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 hidden md:block">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                            <Input
                                type="text"
                                placeholder="Mumbai, Remote..."
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
                            Search Auditions
                        </Button>
                    </div>
                </div>

                {/* Featured Jobs Section */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Featured Auditions</h3>
                            <p className="text-gray-500 text-sm">Curated opportunities just for you</p>
                        </div>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold" onClick={() => navigate('/auth')}>
                            See All <ChevronRight className="w-4 h-4 ml-1" />
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
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">{job.type}</Badge>
                                </div>

                                <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                <p className="text-sm text-gray-500 mb-4 font-medium">{job.production}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 rounded border border-gray-100">{tag}</span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                    <span>{job.posted}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Role Pills Grid */}
                <div className="max-w-6xl mx-auto">
                    <p className="text-center text-gray-500 mb-6 text-sm font-medium uppercase tracking-widest">Trending Categories</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {POPULAR_ROLES.map((role, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className="rounded-full px-6 py-3 text-gray-700 border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 text-sm font-medium"
                                onClick={() => navigate('/auth')}
                            >
                                <role.icon className="w-4 h-4 mr-2 text-orange-500" />
                                {role.title}
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
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="bg-[#FFF8F2] rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-visible">

                    {/* Text & Illustration Left */}
                    <div className="lg:w-1/3 space-y-6 relative z-10">
                        <div className="w-48 h-48 bg-gray-100 rounded-full mx-auto lg:mx-0 flex items-center justify-center mb-6">
                            <img
                                src="https://cdni.iconscout.com/illustration/premium/thumb/job-search-illustration-download-in-svg-png-gif-file-formats--online-business-hiring-pack-people-illustrations-3682977.png"
                                alt="Roles Illustration"
                                className="w-40 h-40 object-contain mix-blend-multiply"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<svg class="w-20 h-20 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-4-8-8s4-8 8-8 8 4 8 8-4-8-8-8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
                                }}
                            />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 leading-tight text-center lg:text-left">
                            Discover Opportunities <br /> Across Popular Roles
                        </h2>
                        <p className="text-gray-600 text-lg text-center lg:text-left">
                            Find auditions and projects in the roles that match your talent. Select a role to explore curated opportunities!
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
                                            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-sm md:text-base">{role.title}</h4>
                                            <p className="text-gray-500 text-sm mt-1 font-medium">{role.count} {role.label}</p>
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
    const paths = [
        { icon: Star, title: "Actor", desc: "Film, TV, & Theater roles" },
        { icon: Music, title: "Musician", desc: "Bands, Solo, & Orchestras" },
        { icon: Video, title: "Director", desc: "Film, Commercial, & Music Video" },
        { icon: Briefcase, title: "Crew", desc: "Production, Editing, & Sound" }
    ]

    return (
        <section id="roles" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 animate-in slide-in-from-bottom-5 duration-700 fade-in">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Path</h2>
                    <p className="text-lg text-gray-600">Select your role to access personalized features.</p>
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
                                Explore <ChevronRight className="w-4 h-4" />
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
    return (
        <section className="py-20 bg-white relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Top Talent</h2>
                        <p className="text-lg text-gray-600">Connect with the most promising artists ready for their next role.</p>
                    </div>
                    <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => navigate('/auth')}>
                        View All Artists <ChevronRight className="w-4 h-4 ml-1" />
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
                                    <p className="text-sm text-white/90 font-medium">{artist.role}</p>
                                    <p className="text-xs text-white/70 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {artist.location}</p>
                                </div>
                            </div>
                            {/* Hover Overlay CTA */}
                            <div className="absolute inset-0 bg-orange-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                                <Button className="bg-white text-orange-600 hover:bg-gray-100 rounded-full font-bold">View Profile</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const HowItWorksSection = () => {
    const steps = [
        { icon: UserPlus, title: "Create Your Profile", desc: "Build your professional portfolio with photos, videos, and performance reels." },
        { icon: Send, title: "Connect & Audition", desc: "Find casting calls, submit auditions, and connect with casting directors worldwide." },
        { icon: Trophy, title: "Land Your Dream Role", desc: "Get hired for amazing opportunities and track your success with tools & analytics." }
    ]
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">How iCastar Works</h2>
                    <p className="text-lg text-gray-600">Get started in three simple steps.</p>
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
        title: 'Mastering the Monologue: Emotional Depth',
        organizer: 'Drama School of Mumbai',
        type: 'Workshop',
        tags: ['Acting', 'Technique'],
        date: '18 Dec, 5:00 PM',
        enrolled: 120,
        image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        closesIn: '12h'
    },
    {
        id: 2,
        title: 'Voice Acting 101: Animation & Commercials',
        organizer: 'Voice Box Studio',
        type: 'Webinar',
        tags: ['Voiceover', 'Career'],
        date: '20 Dec, 2:00 PM',
        enrolled: 450,
        image: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        closesIn: '2d'
    },
    {
        id: 3,
        title: '30-Day Self-Tape Audition Challenge',
        organizer: 'Casting Directors Guild',
        type: 'Challenge',
        tags: ['Audition', 'Challenge'],
        date: '01 Jan, 10:00 AM',
        enrolled: 890,
        image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        closesIn: '5h'
    }
]

export const EventsSection = () => {
    return (
        <section className="py-20 bg-white border-b border-gray-100 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">

                    {/* Left Side: Header & Illustration */}
                    <div className="lg:w-1/3 text-center lg:text-left flex flex-col items-center lg:items-start shrink-0">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            Upcoming events <br className="hidden lg:block" /> and challenges
                        </h2>
                        <div className="relative w-64 h-64 bg-orange-50 rounded-full flex items-center justify-center mb-8">
                            {/* Abstract Illustration Placeholder */}
                            <img
                                src="https://img.freepik.com/free-vector/hand-drawn-business-people-illustration_52683-66806.jpg?w=740&t=st=1700000000~exp=1700000000~hmac=dummy" // Using a generic illustration style URL or fallback to icon 
                                alt="Events Illustration"
                                className="w-56 h-56 object-contain opacity-90 mix-blend-multiply"
                                onError={(e) => {
                                    e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/747/747376.png" // Fallback icon
                                    e.currentTarget.className = "w-32 h-32 opacity-50"
                                }}
                            />
                        </div>
                        <p className="text-gray-600 text-lg max-w-xs mb-6">
                            Boost your skills with workshops, webinars, and challenges hosted by industry experts.
                        </p>
                        <Button variant="link" className="text-orange-600 font-bold p-0 h-auto hover:text-orange-700">
                            See all events <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    {/* Right Side: Horizontal Scroll Cards */}
                    <div className="lg:w-2/3 w-full overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide flex gap-6 snap-x snap-mandatory">
                        {EVENTS.map((event) => (
                            <Card key={event.id} className="min-w-[320px] max-w-[320px] snap-center shrink-0 border-gray-200 hover:shadow-xl transition-shadow duration-300 overflow-hidden group bg-white rounded-2xl">
                                {/* Card Header Image */}
                                <div className="relative h-40 bg-gray-100">
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-0 left-0 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-br-lg backdrop-blur-sm">
                                        Entry closes in {event.closesIn}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                        {event.type}
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
                                        {event.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.enrolled} Enrolled</span>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-4 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold h-9 text-sm flex items-center justify-center gap-2">
                                        View details
                                    </Button>
                                    <div className="mt-3 flex items-center gap-1 text-xs text-orange-600 font-medium">
                                        <Star className="w-3 h-3 fill-orange-600" /> Learn from experts
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
    const StatItem = ({ end, label, color }: { end: number, label: string, color: string }) => {
        const { count, countRef } = useCounter(end)
        return (
            <div className="text-center" ref={countRef}>
                <div className={`text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${color}`}>
                    {count.toLocaleString()}{label.includes("Rate") ? "%" : "+"}
                </div>
                <p className="text-gray-500 font-medium uppercase tracking-wide text-sm">{label}</p>
            </div>
        )
    }

    return (
        <section className="py-20 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    <StatItem end={50000} label="Active Artists" color="from-orange-600 to-amber-500" />
                    <StatItem end={2000} label="Casting Directors" color="from-blue-600 to-purple-500" />
                    <StatItem end={100000} label="Successful Auditions" color="from-green-600 to-emerald-500" />
                    <StatItem end={95} label="Success Rate" color="from-red-500 to-pink-500" />
                </div>
            </div>
        </section>
    )
}

export const TestimonialsSection = () => {
    return (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
                    <p className="text-xl text-slate-300">Real stories from our creative community.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t) => (
                        <div key={t.id} className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 hover:border-orange-500/50 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500" />
                                <div>
                                    <h4 className="font-bold text-white">{t.name}</h4>
                                    <p className="text-sm text-slate-400">{t.role}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed italic">"{t.quote}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const AboutSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            About Icastar: The Creative Industry's Connection Hub
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Icastar was built on the belief that talent, no matter where it comes from, should be easy to find, connect with, and hire.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200">
                            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-6">
                                <Star className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Empowering the Artist</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We give every artist a professional, one-click shareable Icastar Profile—a comprehensive portfolio that instantly provides recruiters with all the necessary details, photos, and video proof of skill.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Apply for roles using our smart <span className="font-semibold text-orange-600">Flash</span> and <span className="font-semibold text-orange-600">Spotlight</span> application system, designed to get your profile noticed based on match percentage.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Streamlining Casting</h3>
                            <p className="text-gray-700 leading-relaxed">
                                For recruiters and casting directors, Icastar is the virtual office that simplifies the entire workflow. From initial selection to final hiring, our platform provides the tools needed to manage talent efficiently and effectively.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-10 rounded-2xl border border-gray-200">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">Our Diverse Community</h3>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Music className="h-8 w-8 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900">Artists</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Writers, singers, dancers, choreographers, makeup artists, stand-up comedians, DJs, musicians, and actors
                                </p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Video className="h-8 w-8 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900">Film Professionals</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Directors, cinematographers, lighting technicians, focus pullers, PR specialists, and distributors
                                </p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-green-600" />
                                </div>
                                <h4 className="font-bold text-lg mb-3 text-gray-900">Event Organizers</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Need talent for a wedding or function? Find your perfect artist on Icastar
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            At Icastar, we aim to eliminate barriers and create a seamless environment where opportunity meets talent.
                        </p>
                        <p className="text-gray-700 font-medium">
                            More information:{' '}
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
    const [openFAQ, setOpenFAQ] = useState<number | null>(null)

    const faqs = [
        {
            id: 1,
            question: "What exactly is an Icastar Profile?",
            answer: {
                artist: "Your Icastar profile is your digital portfolio, supercharged! It's the sleek, one-click link you send to recruiters and casting directors. They instantly get a full picture: your essential details, stunning photos, and, most importantly, a glimpse of your talent through your audition video. It's your professional handshake in a single click.",
                recruiter: "Think of your Icastar profile as your virtual casting office. It's a powerful, streamlined web platform where you can effortlessly discover, select, connect with, and hire the perfect artist or professional for any project."
            }
        },
        {
            id: 2,
            question: "How does Icastar actually work?",
            answer: {
                main: "Icastar is the ultimate creative bridge! We connect aspiring and established artists with the busy recruiters and casting professionals looking for talent. We make the finding, connecting, and hiring process simple and seamless for everyone."
            }
        },
        {
            id: 3,
            question: "How do I apply for an audition?",
            answer: {
                main: "It couldn't be easier! Our Call to Action is crystal clear:",
                steps: [
                    "Find a casting call that excites you",
                    "Click the easy-to-find 'Apply' button",
                    "Choose your application method: Flash or Spotlight!"
                ]
            }
        },
        {
            id: 4,
            question: "What's the deal with Flash and Spotlight credits?",
            answer: {
                main: "These credits are designed to make the casting director's selection process smarter and faster! They are based on your profile's match percentage to the role.",
                details: "The Flash application should be used when you have a less matching profile. Conversely, the Spotlight application should be used when you have a perfect match of profile - this is considered the direct path and helps the casting director notice your profile immediately."
            }
        },
        {
            id: 5,
            question: "Is Icastar only for actors?",
            answer: {
                main: "Absolutely not! Icastar is a vast, inclusive platform for the entire creative ecosystem, connecting talent across all needs:",
                categories: [
                    {
                        title: "For the Artists",
                        desc: "We are a hub for performers and creators of all types! This includes actors, writers, singers, dancers, makeup artists, choreographers, musicians, stand-up comedians, DJs, and many more!"
                    },
                    {
                        title: "For the Industry Professionals",
                        desc: "The platform is essential for those behind the scenes, welcoming directors, cinematographers, lighting technicians, focus pullers, PR specialists, and distributors. You name it, you belong here!"
                    },
                    {
                        title: "For Individuals & Events",
                        desc: "Need talent for a special occasion? Icastar is also the place for individuals who want to hire artists for private events like programs, weddings, and functions."
                    }
                ]
            }
        },
        {
            id: 6,
            question: "Why is my profile restricted?",
            answer: {
                main: "Profile restrictions typically occur when a user hasn't followed our community guidelines or Terms and Conditions. Please visit our dedicated Terms and Conditions page to review the full details and understand the next steps."
            }
        }
    ]

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            Got questions? We've got answers!
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
                                                <p className="font-semibold text-orange-600 mb-2">For the Artist:</p>
                                                <p>{faq.answer.artist}</p>
                                            </div>
                                        )}
                                        {faq.answer.recruiter && (
                                            <div className="mb-4">
                                                <p className="font-semibold text-blue-600 mb-2">For Recruiters/Casting Directors:</p>
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
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Got More Questions?</h3>
                        <p className="text-gray-700 mb-4">
                            If you need further assistance, don't hesitate! Just shoot us an email, and we'll be happy to help you shine.
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
                            Email Us: admin.icastar@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
