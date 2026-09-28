import { defineMessages } from '../defineMessages'

// Reset password screen (pages/auth/ResetPasswordPage.tsx)
export default defineMessages({
  en: {
    title: 'Reset Password',
    subtitleBefore: 'Enter a new password for ',
    subtitleAfter: '',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: 'Enter new password',
    minLengthHint: 'Minimum 8 characters',
    confirmPasswordPlaceholder: 'Confirm new password',
    resetting: 'Resetting...',
    submit: 'Reset Password',
    verifying: 'Verifying reset link...',
    backToLogin: 'Back to Login',
    invalid: {
      title: 'Invalid or Expired Link',
      message: 'This password reset link is invalid or has expired.',
      requestNewLink: 'Request New Link',
    },
    success: {
      title: 'Password Reset Successful!',
      message: 'Your password has been updated successfully.',
      redirecting: 'Redirecting to login page...',
    },
    errors: {
      noToken: 'No reset token provided.',
      invalidOrExpired: 'This reset link is invalid or has expired.',
      verifyFailed: 'Failed to verify reset link. Please try again.',
      passwordsMismatch: 'Passwords do not match',
      passwordMin: 'Password must be at least 8 characters',
      resetFailed: 'Failed to reset password. Please try again.',
      networkError: 'Unable to connect to the server. Please check your internet connection.',
    },
  },
  mr: {
    title: 'पासवर्ड रीसेट करा',
    subtitleBefore: '',
    subtitleAfter: ' साठी नवीन पासवर्ड प्रविष्ट करा',
    newPasswordLabel: 'नवीन पासवर्ड',
    newPasswordPlaceholder: 'नवीन पासवर्ड प्रविष्ट करा',
    minLengthHint: 'किमान 8 अक्षरे',
    confirmPasswordPlaceholder: 'नवीन पासवर्डची पुष्टी करा',
    resetting: 'रीसेट करत आहे...',
    submit: 'पासवर्ड रीसेट करा',
    verifying: 'रीसेट लिंक पडताळत आहे...',
    backToLogin: 'लॉग इनकडे परत जा',
    invalid: {
      title: 'अवैध किंवा कालबाह्य लिंक',
      message: 'ही पासवर्ड रीसेट लिंक अवैध आहे किंवा तिची मुदत संपली आहे.',
      requestNewLink: 'नवीन लिंकची विनंती करा',
    },
    success: {
      title: 'पासवर्ड यशस्वीरित्या रीसेट झाला!',
      message: 'तुमचा पासवर्ड यशस्वीरित्या अपडेट झाला आहे.',
      redirecting: 'लॉग इन पेजकडे नेत आहे...',
    },
    errors: {
      noToken: 'रीसेट टोकन दिलेले नाही.',
      invalidOrExpired: 'ही रीसेट लिंक अवैध आहे किंवा तिची मुदत संपली आहे.',
      verifyFailed: 'रीसेट लिंक पडताळता आली नाही. कृपया पुन्हा प्रयत्न करा.',
      passwordsMismatch: 'पासवर्ड जुळत नाहीत',
      passwordMin: 'पासवर्ड किमान 8 अक्षरांचा असावा',
      resetFailed: 'पासवर्ड रीसेट करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
      networkError: 'सर्व्हरशी कनेक्ट होता आले नाही. कृपया तुमचे इंटरनेट कनेक्शन तपासा.',
    },
  },
})
