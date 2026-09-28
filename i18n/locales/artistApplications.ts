import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    title: 'My Applications',
    subtitle: 'Keep track of all your job applications in one place.',
    table: {
      jobTitle: 'Job Title',
      dateApplied: 'Date Applied',
    },
    empty: {
      title: 'No Applications Found',
      description: 'You have not applied to any jobs yet.',
    },
    loadFailed: 'Failed to load applications. Please try again later.',
  },
  mr: {
    title: 'माझे अर्ज',
    subtitle: 'तुमच्या सर्व नोकरी अर्जांचा मागोवा एकाच ठिकाणी ठेवा.',
    table: {
      jobTitle: 'नोकरीचे शीर्षक',
      dateApplied: 'अर्जाची तारीख',
    },
    empty: {
      title: 'कोणतेही अर्ज सापडले नाहीत',
      description: 'तुम्ही अद्याप कोणत्याही नोकरीसाठी अर्ज केलेला नाही.',
    },
    loadFailed: 'अर्ज लोड करता आले नाहीत. कृपया नंतर पुन्हा प्रयत्न करा.',
  },
})
