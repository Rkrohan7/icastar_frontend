import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logo from '../../assets/icaster.png'

const TermsAndConditionsPage = () => {
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
                Terms and Conditions
              </h1>
              <p className="text-lg text-gray-600">
                Last Updated: December 2025
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
              {/* Definition of Terms */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Definition of Terms</h3>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <div>
                    <strong className="text-gray-900">1. "Website"</strong> - Refers to the online platform operated and owned by the Company, including its domain name and all content, pages, and services made available through it. It serves as a digital space to connect artists, producers, directors, and other entertainment professionals.
                  </div>
                  <div>
                    <strong className="text-gray-900">2. "Resources"</strong> - Means all digital materials, tools, data, media, features, and functionalities provided through the Website, including but not limited to text, graphics, videos, software, and communication systems that facilitate interaction between Users.
                  </div>
                  <div>
                    <strong className="text-gray-900">3. "Service"</strong> - Refers to any feature, functionality, or offering provided through the Website by the Company, including but not limited to account creation, profile management, content posting, communication between Users, and access to networking opportunities within the entertainment industry.
                  </div>
                  <div>
                    <strong className="text-gray-900">4. "Terms and Conditions"</strong> - Means this legally binding agreement between the User and the Company that governs the access to and use of the Website, its Resources, and Services. By using the Website, the User agrees to abide by all rules, policies, and obligations outlined in these Terms and Conditions.
                  </div>
                  <div>
                    <strong className="text-gray-900">5. "You" / "User"</strong> - Refers to any individual or entity that accesses, browses, registers on, or uses the Website or its Services in any capacity, whether as an artist, producer, director, or other professional within or outside the entertainment industry.
                  </div>
                  <div>
                    <strong className="text-gray-900">6. "Country"</strong> - Refers to the Republic of India, where the Website is operated and governed under Indian law. All legal obligations, disputes, and interpretations of these Terms and Conditions shall be subject to the laws and jurisdiction of India.
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h3>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">1. Introduction</h4>
                    <p>This platform ("Website" or "Service") is operated with the purpose of bridging the gap between artists, producers, directors, and other professionals within the entertainment industry. By accessing or using this Website, you ("User") agree to be bound by these Terms and Conditions.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">2. User Information and Accuracy</h4>
                    <p>It is mandatory for all Users to provide accurate, complete, and truthful information while registering or using the Website. If any information provided by the User is found to be false, misleading, or incomplete, the User shall be solely responsible for any resulting consequences, including suspension or termination of their account.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">3. Limitation of Liability</h4>
                    <p>The Website serves solely as a networking and connection platform for entertainment professionals. The Company or Website owners shall not be held responsible or liable for any agreements, disputes, transactions, or interactions that occur between Users or through the use of this platform.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">4. User Content and Conduct</h4>
                    <p className="mb-2">Users may post written content, images, or videos on the Website. It is the User's responsibility to ensure that such content:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Does not promote hatred, discrimination, or violence on the basis of religion, caste, gender, or any other grounds;</li>
                      <li>Does not violate any applicable laws; and</li>
                      <li>Does not harm the public, social, or cultural environment in any manner.</li>
                    </ul>
                    <p className="mt-2">Any violation of these conditions may result in immediate account suspension or removal of the content.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">5. Content Moderation</h4>
                    <p>All content posted by Users shall be subject to review and approval by the Company. The Company reserves the right, at its sole discretion, to publish, reject, or remove any content without providing prior notice or justification.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">6. Account Suspension and Termination</h4>
                    <p>The Company reserves the right to suspend, deactivate, or permanently delete any User account without prior notice if the User is found violating these Terms and Conditions or engaging in any unauthorized or unlawful activity.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">7. Compliance with Laws</h4>
                    <p>Users are required to comply with all applicable laws, rules, and regulations of India while using the Website or any of its services.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">8. Grievance Redressal</h4>
                    <p>In the event of any complaint, concern, or dispute regarding the Website or its services, Users are required to first contact the Company through the official grievance redressal channel before taking any further action.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">9. Amendments to Terms and Conditions</h4>
                    <p>The Company reserves the right to modify, update, or replace these Terms and Conditions at any time without prior notice. Continued use of the Website after such modifications constitutes acceptance of the revised Terms and Conditions.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">10. Intellectual Property Rights</h4>
                    <p>All content, materials, and services available on this Website, including but not limited to text, design, graphics, and logos, are protected under applicable copyright and intellectual property laws. Unauthorized use, reproduction, or distribution of such materials is strictly prohibited.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">11. Third-Party Links</h4>
                    <p>This Website may contain links to third-party websites or resources. The Company does not endorse, control, or take responsibility for the content, privacy practices, or reliability of any such third-party resources. Users access these links at their own risk.</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">12. Governing Law and Jurisdiction</h4>
                    <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to the use of this Website shall be subject to the exclusive jurisdiction of the courts located in India.</p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-bold text-gray-900 mb-2">Contact Us</h4>
                <p className="text-gray-700">
                  If you have any questions about our Terms and Conditions, please contact us at:
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

export default TermsAndConditionsPage
