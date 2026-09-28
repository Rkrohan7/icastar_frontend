import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    searchPlaceholder: 'Search skills...',
    count: '{{count}} skills',
    empty: 'No skills found',
    artists: '{{count}} artists',
    jobs: '{{count}} jobs',
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      accessDenied: 'Access denied — admin role required.',
      loadFailed: 'Unable to load skills.',
    },
  },
  mr: {
    searchPlaceholder: 'कौशल्ये शोधा...',
    count: '{{count}} कौशल्ये',
    empty: 'कोणतीही कौशल्ये सापडली नाहीत',
    artists: '{{count}} कलाकार',
    jobs: '{{count}} नोकऱ्या',
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      accessDenied: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      loadFailed: 'कौशल्ये लोड करता आली नाहीत.',
    },
  },
})
