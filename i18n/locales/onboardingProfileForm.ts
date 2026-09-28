import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    title: 'Profile Details',
    subtitle: 'Complete your artist profile to get started',
    submit: 'Submit & Complete Onboarding',
    errors: {
      professionRequired: 'At least one profession is required',
      genderRequired: 'Gender is required',
      cityRequired: 'City is required',
      dateOfBirthRequired: 'Date of birth is required',
      submitFailed: 'Failed to submit the form. Please try again.',
    },
    toast: {
      createdWelcome: 'Profile created successfully! Welcome to iCastar.',
      created: 'Profile created successfully!',
      statusNotUpdated: 'Onboarding status not updated. Please contact support.',
    },
  },
  mr: {
    title: 'प्रोफाइल तपशील',
    subtitle: 'सुरुवात करण्यासाठी तुमचे कलाकार प्रोफाइल पूर्ण करा',
    submit: 'सबमिट करा आणि ऑनबोर्डिंग पूर्ण करा',
    errors: {
      professionRequired: 'किमान एक व्यवसाय निवडणे आवश्यक आहे',
      genderRequired: 'लिंग आवश्यक आहे',
      cityRequired: 'शहर आवश्यक आहे',
      dateOfBirthRequired: 'जन्मतारीख आवश्यक आहे',
      submitFailed: 'फॉर्म सबमिट करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
    },
    toast: {
      createdWelcome: 'प्रोफाइल यशस्वीरित्या तयार झाले! iCastar मध्ये तुमचे स्वागत आहे.',
      created: 'प्रोफाइल यशस्वीरित्या तयार झाले!',
      statusNotUpdated: 'ऑनबोर्डिंगची स्थिती अपडेट झाली नाही. कृपया सपोर्टशी संपर्क साधा.',
    },
  },
})
