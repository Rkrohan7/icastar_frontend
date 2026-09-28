import { defineMessages } from '../defineMessages'

// Privacy Policy page (pages/auth/PrivacyPolicyPage.tsx).
// Sections s1–s9 are rendered in order; `emailBefore`/`emailAfter` wrap the
// contact email link, which sits at a different place in the Marathi sentence.
export default defineMessages({
  en: {
    backToHome: 'Back to Home',
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: December 2025',
    sections: {
      s1: {
        title: '1. Information We Collect',
        intro: 'We collect the following types of information when you use our Website:',
        items: {
          personal: {
            label: 'a. Personal Information:',
            text: 'Information you voluntarily provide during registration or while using the Service, such as full name, email address, phone number, date of birth, gender, and profile details (including photos, videos, and professional background).',
          },
          nonPersonal: {
            label: 'b. Non-Personal Information:',
            text: 'Data automatically collected while using the Website, such as IP address, browser type, device information, access times, and pages visited.',
          },
          content: {
            label: 'c. Content Information:',
            text: 'Any text, photo, video, or media you upload, post, or share on the platform.',
          },
        },
      },
      s2: {
        title: '2. How We Use Your Information',
        intro: 'We use the collected information to:',
        items: {
          i1: 'Provide and maintain our Website and its features',
          i2: 'Facilitate communication between Users',
          i3: 'Improve user experience',
          i4: 'Send updates or promotional content (with your consent)',
          i5: 'Comply with legal obligations',
        },
      },
      s3: {
        title: '3. Sharing of Information',
        intro: 'Your information may be shared in the following cases:',
        items: {
          i1: 'With other Users when you post publicly',
          i2: 'With service providers for hosting, analytics, and maintenance',
          i3: 'For legal reasons, if required by law',
          i4: 'In case of a merger or acquisition',
        },
        outro: 'We do not sell or rent personal data.',
      },
      s4: {
        title: '4. Data Retention',
        emailBefore:
          'We retain personal information as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. You may request deletion of your data by contacting us at ',
        emailAfter: '',
      },
      s5: {
        title: '5. Data Security',
        text: 'We implement reasonable technical and organizational measures to protect personal data from unauthorized access, alteration, or disclosure. However, no online system can guarantee complete security.',
      },
      s6: {
        title: '6. User Rights',
        emailBefore:
          'You have rights to access, review, correct, or delete your data. You may also withdraw consent for promotional communication at any time by contacting us at ',
        emailAfter: '',
      },
      s7: {
        title: '7. Cookies and Tracking Technologies',
        text: 'Our Website may use cookies to recognize returning Users, analyze usage, and personalize experience. You can disable cookies via browser settings, though some features may not function properly.',
      },
      s8: {
        title: '8. Third-Party Links',
        text: 'This Website may contain links to third-party sites. We are not responsible for their privacy practices or content. Users are advised to review those policies independently.',
      },
      s9: {
        title: '9. Governing Law',
        text: 'This Privacy Policy shall be governed by and construed in accordance with the laws of India, and disputes shall be subject to the jurisdiction of courts located in India.',
      },
    },
    contact: {
      title: 'Contact Us',
      text: 'If you have any questions about our Privacy Policy or Terms and Conditions, please contact us at:',
    },
  },
  mr: {
    backToHome: 'होम पेजवर परत जा',
    title: 'गोपनीयता धोरण',
    lastUpdated: 'अखेरचे अद्यतन: डिसेंबर 2025',
    sections: {
      s1: {
        title: '1. आम्ही गोळा करत असलेली माहिती',
        intro: 'तुम्ही आमच्या वेबसाइटचा वापर करता तेव्हा आम्ही पुढील प्रकारची माहिती गोळा करतो:',
        items: {
          personal: {
            label: 'अ. वैयक्तिक माहिती:',
            text: 'नोंदणीच्या वेळी किंवा सेवेचा वापर करताना तुम्ही स्वेच्छेने दिलेली माहिती, जसे की पूर्ण नाव, ईमेल पत्ता, फोन नंबर, जन्मतारीख, लिंग आणि प्रोफाइल तपशील (फोटो, व्हिडिओ आणि व्यावसायिक पार्श्वभूमी यांसह).',
          },
          nonPersonal: {
            label: 'ब. अवैयक्तिक माहिती:',
            text: 'वेबसाइटचा वापर करताना आपोआप संकलित होणारा डेटा, जसे की IP पत्ता, ब्राउझरचा प्रकार, डिव्हाइसची माहिती, प्रवेशाच्या वेळा आणि भेट दिलेली पृष्ठे.',
          },
          content: {
            label: 'क. मजकुराशी संबंधित माहिती:',
            text: 'तुम्ही प्लॅटफॉर्मवर अपलोड, पोस्ट किंवा शेअर केलेला कोणताही मजकूर, फोटो, व्हिडिओ किंवा इतर माध्यम.',
          },
        },
      },
      s2: {
        title: '2. आम्ही तुमच्या माहितीचा वापर कसा करतो',
        intro: 'गोळा केलेल्या माहितीचा वापर आम्ही पुढील कारणांसाठी करतो:',
        items: {
          i1: 'आमची वेबसाइट व तिची वैशिष्ट्ये उपलब्ध करून देणे आणि ती सुस्थितीत राखणे',
          i2: 'वापरकर्त्यांमधील संवाद सुलभ करणे',
          i3: 'वापरकर्त्यांचा अनुभव अधिक चांगला करणे',
          i4: 'अपडेट्स किंवा प्रचारात्मक मजकूर पाठविणे (तुमच्या संमतीने)',
          i5: 'कायदेशीर दायित्वांचे पालन करणे',
        },
      },
      s3: {
        title: '3. माहिती सामायिक करणे',
        intro: 'तुमची माहिती पुढील परिस्थितींमध्ये सामायिक केली जाऊ शकते:',
        items: {
          i1: 'तुम्ही सार्वजनिकरित्या पोस्ट करता तेव्हा इतर वापरकर्त्यांसोबत',
          i2: 'होस्टिंग, विश्लेषण आणि देखभालीसाठी सेवा पुरवठादारांसोबत',
          i3: 'कायद्याने आवश्यक असल्यास, कायदेशीर कारणांसाठी',
          i4: 'विलीनीकरण किंवा अधिग्रहण झाल्यास',
        },
        outro: 'आम्ही वैयक्तिक डेटा विकत नाही किंवा भाड्याने देत नाही.',
      },
      s4: {
        title: '4. डेटाचे जतन',
        emailBefore:
          'या गोपनीयता धोरणात नमूद केलेले उद्देश पूर्ण करण्यासाठी आवश्यक असेल तितका काळ, किंवा कायद्याने आवश्यक असेल तितका काळ, आम्ही वैयक्तिक माहिती जतन करून ठेवतो. तुम्ही ',
        emailAfter: ' येथे आमच्याशी संपर्क साधून तुमचा डेटा हटविण्याची विनंती करू शकता.',
      },
      s5: {
        title: '5. डेटा सुरक्षा',
        text: 'वैयक्तिक डेटाचे अनधिकृत प्रवेश, फेरबदल किंवा प्रकटीकरण यांपासून संरक्षण करण्यासाठी आम्ही वाजवी तांत्रिक व संस्थात्मक उपाययोजना करतो. तथापि, कोणतीही ऑनलाइन प्रणाली संपूर्ण सुरक्षिततेची हमी देऊ शकत नाही.',
      },
      s6: {
        title: '6. वापरकर्त्यांचे हक्क',
        emailBefore:
          'तुमचा डेटा पाहणे, त्याचे पुनरावलोकन करणे, तो दुरुस्त करणे किंवा हटविणे यांचा तुम्हाला हक्क आहे. तसेच तुम्ही ',
        emailAfter: ' येथे आमच्याशी संपर्क साधून प्रचारात्मक संवादासाठी दिलेली संमती कधीही मागे घेऊ शकता.',
      },
      s7: {
        title: '7. कुकीज आणि ट्रॅकिंग तंत्रज्ञान',
        text: 'पुन्हा भेट देणाऱ्या वापरकर्त्यांना ओळखण्यासाठी, वापराचे विश्लेषण करण्यासाठी आणि अनुभव वैयक्तिकृत करण्यासाठी आमची वेबसाइट कुकीजचा वापर करू शकते. तुम्ही ब्राउझर सेटिंग्जद्वारे कुकीज बंद करू शकता, मात्र अशा वेळी काही वैशिष्ट्ये योग्यरित्या कार्य न करण्याची शक्यता आहे.',
      },
      s8: {
        title: '8. तृतीय-पक्ष लिंक्स',
        text: 'या वेबसाइटवर तृतीय-पक्ष साइट्सच्या लिंक्स असू शकतात. त्यांच्या गोपनीयता पद्धतींसाठी किंवा मजकुरासाठी आम्ही जबाबदार नाही. वापरकर्त्यांनी त्या धोरणांचे स्वतंत्रपणे पुनरावलोकन करावे, असा सल्ला देण्यात येतो.',
      },
      s9: {
        title: '9. नियामक कायदा',
        text: 'हे गोपनीयता धोरण भारताच्या कायद्यांनुसार नियंत्रित होईल आणि त्याचा अर्थ त्याच कायद्यांनुसार लावला जाईल, तसेच कोणतेही विवाद भारतातील न्यायालयांच्या अधिकारक्षेत्राच्या अधीन राहतील.',
      },
    },
    contact: {
      title: 'आमच्याशी संपर्क साधा',
      text: 'आमच्या गोपनीयता धोरणाबाबत किंवा अटी व शर्तींबाबत तुम्हाला काही प्रश्न असल्यास, कृपया येथे आमच्याशी संपर्क साधा:',
    },
  },
})
