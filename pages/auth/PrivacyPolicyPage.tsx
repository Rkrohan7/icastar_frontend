import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logo from '../../assets/icaster.png'

const PrivacyPolicyPage = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/">
            <img src={logo} alt="iCastar" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden md:inline">Back to Home</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Privacy Policy
              </h1>
              <p className="text-lg text-gray-600">
                Last Updated: December 2025
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">1. Information We Collect</h4>
                  <p className="mb-2">We collect the following types of information when you use our Website:</p>
                  <div className="space-y-3 ml-4">
                    <div>
                      <strong className="text-gray-900">a. Personal Information:</strong> Information you voluntarily provide during registration or while using the Service, such as full name, email address, phone number, date of birth, gender, and profile details (including photos, videos, and professional background).
                    </div>
                    <div>
                      <strong className="text-gray-900">b. Non-Personal Information:</strong> Data automatically collected while using the Website, such as IP address, browser type, device information, access times, and pages visited.
                    </div>
                    <div>
                      <strong className="text-gray-900">c. Content Information:</strong> Any text, photo, video, or media you upload, post, or share on the platform.
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">2. How We Use Your Information</h4>
                  <p className="mb-2">We use the collected information to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide and maintain our Website and its features</li>
                    <li>Facilitate communication between Users</li>
                    <li>Improve user experience</li>
                    <li>Send updates or promotional content (with your consent)</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">3. Sharing of Information</h4>
                  <p className="mb-2">Your information may be shared in the following cases:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>With other Users when you post publicly</li>
                    <li>With service providers for hosting, analytics, and maintenance</li>
                    <li>For legal reasons, if required by law</li>
                    <li>In case of a merger or acquisition</li>
                  </ul>
                  <p className="mt-2">We do not sell or rent personal data.</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">4. Data Retention</h4>
                  <p>We retain personal information as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. You may request deletion of your data by contacting us at <a href="mailto:admin.icastar@gmail.com" className="text-orange-600 hover:text-orange-700 underline">admin.icastar@gmail.com</a></p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">5. Data Security</h4>
                  <p>We implement reasonable technical and organizational measures to protect personal data from unauthorized access, alteration, or disclosure. However, no online system can guarantee complete security.</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">6. User Rights</h4>
                  <p>You have rights to access, review, correct, or delete your data. You may also withdraw consent for promotional communication at any time by contacting us at <a href="mailto:admin.icastar@gmail.com" className="text-orange-600 hover:text-orange-700 underline">admin.icastar@gmail.com</a></p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">7. Cookies and Tracking Technologies</h4>
                  <p>Our Website may use cookies to recognize returning Users, analyze usage, and personalize experience. You can disable cookies via browser settings, though some features may not function properly.</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">8. Third-Party Links</h4>
                  <p>This Website may contain links to third-party sites. We are not responsible for their privacy practices or content. Users are advised to review those policies independently.</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">9. Governing Law</h4>
                  <p>This Privacy Policy shall be governed by and construed in accordance with the laws of India, and disputes shall be subject to the jurisdiction of courts located in India.</p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-bold text-gray-900 mb-2">Contact Us</h4>
                <p className="text-gray-700">
                  If you have any questions about our Privacy Policy or Terms and Conditions, please contact us at:
                </p>
                <a
                  href="mailto:admin.icastar@gmail.com"
                  className="inline-block mt-3 text-orange-600 hover:text-orange-700 font-semibold underline"
                >
                  admin.icastar@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage
