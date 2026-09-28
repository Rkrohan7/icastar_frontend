import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    searchPlaceholder: 'Search by artist or audition...',
    allStatuses: 'All Statuses',
    showing: 'Showing {{shown}} of {{total}} audition applications',
    empty: 'No applications found',
    columns: {
      artist: 'Artist',
      audition: 'Audition',
      recruiter: 'Recruiter',
      applied: 'Applied',
    },
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      accessDenied: 'Access denied — admin role required.',
      loadFailed: 'Unable to load audition applications.',
    },
  },
  mr: {
    searchPlaceholder: 'कलाकार किंवा ऑडिशननुसार शोधा...',
    allStatuses: 'सर्व स्थिती',
    showing: '{{total}} पैकी {{shown}} ऑडिशन अर्ज दाखवत आहे',
    empty: 'कोणतेही अर्ज सापडले नाहीत',
    columns: {
      artist: 'कलाकार',
      audition: 'ऑडिशन',
      recruiter: 'रिक्रूटर',
      applied: 'अर्जाची तारीख',
    },
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      accessDenied: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      loadFailed: 'ऑडिशन अर्ज लोड करता आले नाहीत.',
    },
  },
})
