import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    searchPlaceholder: 'Search by artist, job or company...',
    allStatuses: 'All Statuses',
    showing: 'Showing {{shown}} of {{total}} job applications',
    empty: 'No applications found',
    columns: {
      artist: 'Artist',
      job: 'Job',
      recruiter: 'Recruiter',
      applied: 'Applied',
    },
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      accessDenied: 'Access denied — admin role required.',
      loadFailed: 'Unable to load job applications.',
    },
  },
  mr: {
    searchPlaceholder: 'कलाकार, नोकरी किंवा कंपनीनुसार शोधा...',
    allStatuses: 'सर्व स्थिती',
    showing: '{{total}} पैकी {{shown}} नोकरी अर्ज दाखवत आहे',
    empty: 'कोणतेही अर्ज सापडले नाहीत',
    columns: {
      artist: 'कलाकार',
      job: 'नोकरी',
      recruiter: 'रिक्रूटर',
      applied: 'अर्जाची तारीख',
    },
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      accessDenied: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      loadFailed: 'नोकरी अर्ज लोड करता आले नाहीत.',
    },
  },
})
