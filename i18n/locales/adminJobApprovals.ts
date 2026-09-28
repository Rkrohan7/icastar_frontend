import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    title: 'Jobs Awaiting Approval',
    pendingCount: '{{count}} pending',
    searchPlaceholder: 'Search by job title or recruiter...',
    empty: 'All clear — no jobs pending approval',
    submitted: 'Submitted {{date}}',
    confirmApprove: 'Approve "{{title}}"?',
    rejectModal: {
      title: 'Reject Job',
      reasonLabel: 'Reason *',
      reasonPlaceholder: 'Explain why this job is being rejected...',
      rejecting: 'Rejecting...',
    },
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      accessDenied: 'Access denied — admin role required.',
      notFound: 'Endpoint not found.',
      loadFailed: 'Unable to load pending jobs.',
      approveFailed: 'Failed to approve',
      rejectFailed: 'Failed to reject',
      reasonRequired: 'Reason is required',
    },
  },
  mr: {
    title: 'मंजुरीच्या प्रतीक्षेतील नोकऱ्या',
    pendingCount: '{{count}} प्रलंबित',
    searchPlaceholder: 'नोकरीचे शीर्षक किंवा रिक्रूटरनुसार शोधा...',
    empty: 'सर्व ठीक आहे — मंजुरीसाठी कोणतीही नोकरी प्रलंबित नाही',
    submitted: '{{date}} रोजी सबमिट केले',
    confirmApprove: '"{{title}}" मंजूर करायचे?',
    rejectModal: {
      title: 'नोकरी नाकारा',
      reasonLabel: 'कारण *',
      reasonPlaceholder: 'ही नोकरी का नाकारली जात आहे ते स्पष्ट करा...',
      rejecting: 'नाकारत आहे...',
    },
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      accessDenied: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      notFound: 'एंडपॉइंट सापडला नाही.',
      loadFailed: 'प्रलंबित नोकऱ्या लोड करता आल्या नाहीत.',
      approveFailed: 'मंजूर करता आले नाही',
      rejectFailed: 'नाकारता आले नाही',
      reasonRequired: 'कारण आवश्यक आहे',
    },
  },
})
