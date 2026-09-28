import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    title: 'Applicants for "{{title}}"',
    backToJobs: 'Back to Jobs',
    noJobSelected: 'No job selected',
    loadFailed: 'Failed to load applicants',
    loadFailedToast: 'Failed to load applicants. Please try again.',
    appliedOn: 'Applied {{date}}',
    candidate: 'Candidate',
    empty: {
      title: 'No Applicants Yet',
      description: 'Check back later or boost this job to attract more candidates.',
    },
  },
  mr: {
    title: '"{{title}}" साठी अर्जदार',
    backToJobs: 'नोकऱ्यांकडे परत जा',
    noJobSelected: 'कोणतीही नोकरी निवडलेली नाही',
    loadFailed: 'अर्जदार लोड करता आले नाहीत',
    loadFailedToast: 'अर्जदार लोड करता आले नाहीत. कृपया पुन्हा प्रयत्न करा.',
    appliedOn: '{{date}} रोजी अर्ज केला',
    candidate: 'उमेदवार',
    empty: {
      title: 'अद्याप कोणतेही अर्जदार नाहीत',
      description: 'नंतर पुन्हा तपासा किंवा अधिक उमेदवार आकर्षित करण्यासाठी ही नोकरी बूस्ट करा.',
    },
  },
})
