import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Camera, Music, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../../assets/icaster.png'
import ctaBg from '../../assets/cta-bg.jpg'
import {
  HeroSection,
  SearchRolesSection,
  PopularRolesSection,
  ArtistShowcaseSection,
  HowItWorksSection,
  StatsSection,
  BlogSection,
  TestimonialsSection,
  EventsSection,
  AboutSection,
  FAQSection
} from './LandingComponents'

const AuthPage = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-white font-sans text-gray-900'>

      {/* Navigation / Header */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center container mx-auto">
        {/* Logo - Wrapped in white container for maximum visibility */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/20">
          <img src={logo} alt="iCaster" className="h-10 md:h-12 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-4">
          {/* Sign In - clearly visible white text against dark hero */}
          <Button
            variant="ghost"
            className="hidden md:flex text-white hover:text-white hover:bg-white/10 text-lg font-semibold px-6 py-2 rounded-full transition-all"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>

          {/* Sign Up - Primary Action */}
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all border border-orange-500/50"
            onClick={() => navigate('/auth')}
          >
            Sign Up
          </Button>
        </div>
      </nav>

      <HeroSection />

      <SearchRolesSection />

      <PopularRolesSection />

      <ArtistShowcaseSection />

      <HowItWorksSection />

      <EventsSection />

      <StatsSection />

      <BlogSection />

      <TestimonialsSection />

      <AboutSection />

      <FAQSection />

      {/* Final CTA Section */}
      <section className='relative py-24 overflow-hidden'>
        <div className="absolute inset-0 z-0">
          <img src={ctaBg} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-amber-900/80 mix-blend-multiply"></div>
        </div>

        <div className='container mx-auto px-4 text-center relative z-10'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight'>
            Ready to Transform Your Career?
          </h2>
          <p className='text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed'>
            Join the fastest growing community of artists and casting directors. Your next role is just a click away.
          </p>
          <Button
            size='lg'
            className='bg-white text-orange-700 hover:bg-gray-100 hover:text-orange-800 text-lg px-12 py-8 rounded-full shadow-2xl transition-transform hover:scale-105 font-bold border-2 border-transparent'
            onClick={() => navigate('/auth')}
          >
            Get Started Today
            <ArrowRight className='ml-2 h-5 w-5' />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-16 border-t border-gray-800'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-12 mb-12'>
            <div className='col-span-1 md:col-span-1'>
              <img src={logo} alt="iCaster" className="h-10 w-auto mb-6 opacity-90 grayscale brightness-200" />
              <p className="text-gray-400 text-sm leading-relaxed">
                The definitive platform for casting professionals and performing artists. Elevate your craft.
              </p>
            </div>

            <div>
              <h4 className='font-bold mb-6 text-lg'>Platform</h4>
              <ul className='space-y-3 text-gray-400 text-sm'>
                <li><Link to="/auth" className='hover:text-amber-500 transition-colors'>Browse Talent</Link></li>
                <li><Link to="/auth" className='hover:text-amber-500 transition-colors'>Find Jobs</Link></li>
                <li><Link to="/auth" className='hover:text-amber-500 transition-colors'>Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold mb-6 text-lg'>Company</h4>
              <ul className='space-y-3 text-gray-400 text-sm'>
                <li><a href="#" className='hover:text-amber-500 transition-colors'>About Us</a></li>
                <li><a href="#" className='hover:text-amber-500 transition-colors'>Careers</a></li>
                <li><a href="/blogs" className='hover:text-amber-500 transition-colors'>Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold mb-6 text-lg'>Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-colors text-white">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm'>
            <p>© 2024 iCastar Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AuthPage
