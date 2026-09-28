import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    approvalsTitle: 'Auditions awaiting approval',
    searchPlaceholder: 'Search by title, project or recruiter...',
    typePlaceholder: 'Filter by type (e.g. LIVE_VIDEO)...',
    allStatuses: 'All Statuses',
    showing: 'Showing {{shown}} of {{total}} auditions',
    empty: 'No auditions found',
    table: {
      audition: 'Audition',
      artist: 'Artist',
      recruiter: 'Recruiter',
      scheduled: 'Scheduled',
    },
    durationMinutes: '{{count}} min',
    updateStatus: 'Update status',
    modal: {
      title: 'Update Audition Status',
      feedback: 'Feedback',
      feedbackPlaceholder: 'Optional feedback...',
      rating: 'Rating (1-5)',
    },
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      forbidden: 'Access denied — admin role required.',
      loadFailed: 'Unable to load auditions.',
      statusFailed: 'Failed to update status',
    },
  },
  mr: {
    approvalsTitle: 'मंजुरीच्या प्रतीक्षेत असलेल्या ऑडिशन्स',
    searchPlaceholder: 'शीर्षक, प्रोजेक्ट किंवा रिक्रूटरनुसार शोधा...',
    typePlaceholder: 'प्रकारानुसार फिल्टर करा (उदा. LIVE_VIDEO)...',
    allStatuses: 'सर्व स्थिती',
    showing: '{{total}} पैकी {{shown}} ऑडिशन्स दाखवत आहे',
    empty: 'कोणत्याही ऑडिशन्स सापडल्या नाहीत',
    table: {
      audition: 'ऑडिशन',
      artist: 'कलाकार',
      recruiter: 'रिक्रूटर',
      scheduled: 'नियोजित वेळ',
    },
    durationMinutes: '{{count}} मिनिटे',
    updateStatus: 'स्थिती अपडेट करा',
    modal: {
      title: 'ऑडिशनची स्थिती अपडेट करा',
      feedback: 'अभिप्राय',
      feedbackPlaceholder: 'ऐच्छिक अभिप्राय...',
      rating: 'रेटिंग (1-5)',
    },
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      forbidden: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      loadFailed: 'ऑडिशन्स लोड करता आल्या नाहीत.',
      statusFailed: 'स्थिती अपडेट करता आली नाही',
    },
  },
})
