import { defineMessages } from '../defineMessages'

// User-facing messages created in services/*.ts (thrown errors shown in the UI,
// fallback success/error text, relative dates). Used via translate().
export default defineMessages({
  en: {
    artistProfile: {
      fetchFailed: 'Failed to fetch artist profile: {{status}}',
    },
    gemini: {
      apiKeyMissing: 'API key is not configured. Cannot fetch suggestions.',
      suggestionsFailed: 'Failed to generate artist suggestions. Please check the console for details.',
    },
    hireRequests: {
      createFailed: 'Failed to create hire request',
      updateStatusFailed: 'Failed to update hire request status',
      withdrawFailed: 'Failed to withdraw hire request',
      reminderFailed: 'Failed to send reminder',
    },
    publicJob: {
      notFound: 'Job not found',
      loadFailed: 'Failed to load job',
      applyFailed: 'Failed to submit application',
    },
    publicArtist: {
      notFound: 'Profile not found',
      loadFailed: 'Failed to load profile',
    },
    onboarding: {
      completed: 'Onboarding completed successfully',
      failed: 'Failed to complete onboarding. Please try again.',
      categoriesFailed: 'Failed to load categories. Please try again.',
      skillsFailed: 'Failed to load skills. Please try again.',
      languagesFailed: 'Failed to load languages. Please try again.',
      mediaUploadFailed: 'Failed to upload media. Please try again.',
    },
    fallback: {
      unknownArtist: 'Unknown Artist',
      untitledRole: 'Untitled Role',
      unknown: 'Unknown',
      artist: 'Artist',
    },
    relativeTime: {
      recently: 'Recently',
      today: 'Today',
      daysAgo_one: '{{count}} day ago',
      daysAgo_other: '{{count}} days ago',
      weeksAgo: '{{count}} weeks ago',
      monthsAgo: '{{count}} months ago',
    },
  },
  mr: {
    artistProfile: {
      fetchFailed: 'कलाकार प्रोफाइल मिळवता आले नाही: {{status}}',
    },
    gemini: {
      apiKeyMissing: 'API की कॉन्फिगर केलेली नाही. सूचना मिळवता येत नाहीत.',
      suggestionsFailed: 'कलाकार सूचना तयार करता आल्या नाहीत. तपशीलासाठी कृपया कन्सोल तपासा.',
    },
    hireRequests: {
      createFailed: 'नियुक्ती विनंती तयार करता आली नाही',
      updateStatusFailed: 'नियुक्ती विनंतीची स्थिती अपडेट करता आली नाही',
      withdrawFailed: 'नियुक्ती विनंती मागे घेता आली नाही',
      reminderFailed: 'रिमाइंडर पाठवता आला नाही',
    },
    publicJob: {
      notFound: 'नोकरी सापडली नाही',
      loadFailed: 'नोकरी लोड करता आली नाही',
      applyFailed: 'अर्ज सबमिट करता आला नाही',
    },
    publicArtist: {
      notFound: 'प्रोफाइल सापडले नाही',
      loadFailed: 'प्रोफाइल लोड करता आले नाही',
    },
    onboarding: {
      completed: 'ऑनबोर्डिंग यशस्वीरित्या पूर्ण झाले',
      failed: 'ऑनबोर्डिंग पूर्ण करता आले नाही. कृपया पुन्हा प्रयत्न करा.',
      categoriesFailed: 'श्रेणी लोड करता आल्या नाहीत. कृपया पुन्हा प्रयत्न करा.',
      skillsFailed: 'कौशल्ये लोड करता आली नाहीत. कृपया पुन्हा प्रयत्न करा.',
      languagesFailed: 'भाषा लोड करता आल्या नाहीत. कृपया पुन्हा प्रयत्न करा.',
      mediaUploadFailed: 'मीडिया अपलोड करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
    },
    fallback: {
      unknownArtist: 'अज्ञात कलाकार',
      untitledRole: 'शीर्षक नसलेली भूमिका',
      unknown: 'अज्ञात',
      artist: 'कलाकार',
    },
    relativeTime: {
      recently: 'नुकतेच',
      today: 'आज',
      daysAgo_one: '{{count}} दिवसापूर्वी',
      daysAgo_other: '{{count}} दिवसांपूर्वी',
      weeksAgo: '{{count}} आठवड्यांपूर्वी',
      monthsAgo: '{{count}} महिन्यांपूर्वी',
    },
  },
})
