import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    verification: {
      verified: {
        text: 'Profile Verified',
        description: 'Your profile is verified and trusted.',
      },
      pending: {
        text: 'Verification Pending',
        description: 'Your profile is under review.',
      },
      notVerified: {
        text: 'Profile Not Verified',
        description: 'Submit your profile for verification.',
      },
      checkStatus: 'Check Status',
      submitForVerification: 'Submit for Verification',
    },
    errors: {
      loadFailed: 'Failed to load profile',
      saveFailed: 'Failed to save profile',
    },
    toast: {
      photoUpdated: 'Profile photo updated!',
      photoUploadFailed: 'Failed to upload photo. Please try again.',
      saved: 'Profile saved successfully!',
    },
    personal: {
      title: 'Personal Information',
      subtitle: 'Update your photo and personal details here.',
    },
    photo: {
      alt: 'Profile photo',
      add: 'Add Photo',
      change: 'Change Photo',
      uploadingProgress: 'Uploading... {{progress}}%',
      delete: 'Delete Photo',
      // Hint sentence: before + <strong>limit</strong> + after
      sizeHintBefore: 'Photo size must be ',
      sizeHintLimit: '{{size}}MB or less',
      sizeHintAfter: '. Supported formats: JPG, PNG, WebP.',
    },
    fields: {
      recruiterType: 'Recruiter Type',
      email: 'Email Address',
      companyName: 'Company Name',
      companyWebsite: 'Company Website',
      companyBio: 'Company Bio',
    },
    recruiterTypes: {
      inHouse: 'In-house',
      agency: 'Agency',
      freelance: 'Freelance',
    },
    company: {
      title: 'Company Information',
      subtitle: 'Details about the company you represent.',
    },
  },
  mr: {
    verification: {
      verified: {
        text: 'प्रोफाइल सत्यापित',
        description: 'तुमचे प्रोफाइल सत्यापित आणि विश्वासार्ह आहे.',
      },
      pending: {
        text: 'सत्यापन प्रलंबित',
        description: 'तुमच्या प्रोफाइलचे पुनरावलोकन सुरू आहे.',
      },
      notVerified: {
        text: 'प्रोफाइल सत्यापित नाही',
        description: 'सत्यापनासाठी तुमचे प्रोफाइल सबमिट करा.',
      },
      checkStatus: 'स्थिती तपासा',
      submitForVerification: 'सत्यापनासाठी सबमिट करा',
    },
    errors: {
      loadFailed: 'प्रोफाइल लोड करता आले नाही',
      saveFailed: 'प्रोफाइल जतन करता आले नाही',
    },
    toast: {
      photoUpdated: 'प्रोफाइल फोटो अपडेट झाला!',
      photoUploadFailed: 'फोटो अपलोड करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
      saved: 'प्रोफाइल यशस्वीरित्या जतन झाले!',
    },
    personal: {
      title: 'वैयक्तिक माहिती',
      subtitle: 'तुमचा फोटो आणि वैयक्तिक तपशील येथे अपडेट करा.',
    },
    photo: {
      alt: 'प्रोफाइल फोटो',
      add: 'फोटो जोडा',
      change: 'फोटो बदला',
      uploadingProgress: 'अपलोड होत आहे... {{progress}}%',
      delete: 'फोटो हटवा',
      sizeHintBefore: 'फोटोचा आकार ',
      sizeHintLimit: '{{size}}MB किंवा त्यापेक्षा कमी',
      sizeHintAfter: ' असावा. समर्थित फॉरमॅट: JPG, PNG, WebP.',
    },
    fields: {
      recruiterType: 'रिक्रूटरचा प्रकार',
      email: 'ईमेल पत्ता',
      companyName: 'कंपनीचे नाव',
      companyWebsite: 'कंपनीची वेबसाइट',
      companyBio: 'कंपनीचा परिचय',
    },
    recruiterTypes: {
      inHouse: 'इन-हाऊस',
      agency: 'एजन्सी',
      freelance: 'फ्रीलान्स',
    },
    company: {
      title: 'कंपनीची माहिती',
      subtitle: 'तुम्ही प्रतिनिधित्व करत असलेल्या कंपनीचा तपशील.',
    },
  },
})
