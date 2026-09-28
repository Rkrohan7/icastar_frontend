import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    filters: {
      searchPlaceholder: 'Search by reporter, reported user or reason...',
      allStatuses: 'All Statuses',
      allPriorities: 'All Priorities',
    },
    showing: 'Showing {{shown}} of {{total}} reports',
    empty: 'No reports to review',
    card: {
      reason: 'Reason:',
      reporter: 'Reporter',
      reported: 'Reported',
      reviewer: 'Reviewer',
      action: 'Action',
      notes: 'Notes:',
      review: 'Review',
    },
    modal: {
      title: 'Review Report',
      priority: 'Priority',
      actionTaken: 'Action Taken',
      resolutionNotes: 'Resolution Notes',
      notesPlaceholder: 'Optional notes...',
    },
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      accessDenied: 'Access denied — admin role required.',
      loadFailed: 'Unable to load reports.',
      updateFailed: 'Failed to update report',
    },
  },
  mr: {
    filters: {
      searchPlaceholder: 'तक्रारकर्ता, तक्रार केलेला वापरकर्ता किंवा कारणानुसार शोधा...',
      allStatuses: 'सर्व स्थिती',
      allPriorities: 'सर्व प्राधान्यक्रम',
    },
    showing: '{{total}} पैकी {{shown}} तक्रारी दाखवत आहे',
    empty: 'पुनरावलोकनासाठी कोणत्याही तक्रारी नाहीत',
    card: {
      reason: 'कारण:',
      reporter: 'तक्रारकर्ता',
      reported: 'तक्रार केलेला',
      reviewer: 'पुनरावलोकनकर्ता',
      action: 'कारवाई',
      notes: 'नोंदी:',
      review: 'पुनरावलोकन करा',
    },
    modal: {
      title: 'तक्रारीचे पुनरावलोकन करा',
      priority: 'प्राधान्य',
      actionTaken: 'केलेली कारवाई',
      resolutionNotes: 'निराकरण नोंदी',
      notesPlaceholder: 'ऐच्छिक नोंदी...',
    },
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      accessDenied: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      loadFailed: 'तक्रारी लोड करता आल्या नाहीत.',
      updateFailed: 'तक्रार अपडेट करता आली नाही',
    },
  },
})
