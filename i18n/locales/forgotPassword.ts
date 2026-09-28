import { defineMessages } from '../defineMessages'

// Forgot password screen (pages/auth/ForgotPasswordPage.tsx)
export default defineMessages({
  en: {
    title: 'Forgot Password',
    subtitle: "Enter your email and we'll send you a reset link",
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email',
    sending: 'Sending...',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    networkError: 'Unable to connect to the server. Please check your internet connection.',
    sent: {
      title: 'Check Your Email',
      messageBefore: 'If an account exists with ',
      messageAfter: ', you will receive a password reset link shortly.',
      expires: 'Link expires in 30 minutes',
    },
  },
  mr: {
    title: 'पासवर्ड विसरलात',
    subtitle: 'तुमचा ईमेल प्रविष्ट करा, आम्ही तुम्हाला रीसेट लिंक पाठवू',
    emailLabel: 'ईमेल पत्ता',
    emailPlaceholder: 'तुमचा ईमेल प्रविष्ट करा',
    sending: 'पाठवत आहे...',
    sendResetLink: 'रीसेट लिंक पाठवा',
    backToLogin: 'लॉग इनकडे परत जा',
    networkError: 'सर्व्हरशी कनेक्ट होता आले नाही. कृपया तुमचे इंटरनेट कनेक्शन तपासा.',
    sent: {
      title: 'तुमचा ईमेल तपासा',
      messageBefore: '',
      messageAfter: ' या ईमेलशी संबंधित खाते अस्तित्वात असल्यास, तुम्हाला लवकरच पासवर्ड रीसेट लिंक मिळेल.',
      expires: 'ही लिंक 30 मिनिटांत कालबाह्य होईल',
    },
  },
})
