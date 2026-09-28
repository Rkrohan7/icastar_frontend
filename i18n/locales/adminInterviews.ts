import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    searchPlaceholder: 'Search by artist, job or recruiter...',
    allStatuses: 'All Statuses',
    showing: 'Showing {{shown}} of {{total}} interviews',
    empty: 'No interviews found',
    notScheduled: 'Not scheduled',
    labels: {
      artist: 'Artist',
      job: 'Job',
      recruiter: 'Recruiter',
      notes: 'Notes',
    },
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      accessDenied: 'Access denied — admin role required.',
      loadFailed: 'Unable to load interviews.',
    },
  },
  mr: {
    searchPlaceholder: 'कलाकार, नोकरी किंवा रिक्रूटरनुसार शोधा...',
    allStatuses: 'सर्व स्थिती',
    showing: '{{total}} पैकी {{shown}} मुलाखती दाखवत आहे',
    empty: 'कोणत्याही मुलाखती सापडल्या नाहीत',
    notScheduled: 'नियोजित नाही',
    labels: {
      artist: 'कलाकार',
      job: 'नोकरी',
      recruiter: 'रिक्रूटर',
      notes: 'नोंदी',
    },
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      accessDenied: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      loadFailed: 'मुलाखती लोड करता आल्या नाहीत.',
    },
  },
})
