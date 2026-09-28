import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    searchPlaceholder: 'Search by name or email...',
    allStatuses: 'All Statuses',
    allCategories: 'All Categories',
    showing: 'Showing {{shown}} of {{total}} recruiters',
    empty: 'No recruiters found',
    table: {
      recruiter: 'Recruiter',
      contact: 'Contact',
      stats: 'Stats',
      joined: 'Joined',
    },
    stats: {
      jobs: '{{count}} jobs',
      hiresApps: '{{hires}} hires · {{apps}} apps',
    },
    verified: 'Verified',
    thisRecruiter: 'this recruiter',
    errors: {
      unauthorized: 'Unauthorized — please log in as an admin.',
      forbidden: 'Access denied — admin role required.',
      notFound: 'Endpoint not found — check backend route {{route}}.',
      loadFailed: 'Unable to load recruiters.',
    },
    pagination: {
      total: '{{total}} total',
    },
  },
  mr: {
    searchPlaceholder: 'नाव किंवा ईमेलने शोधा...',
    allStatuses: 'सर्व स्थिती',
    allCategories: 'सर्व श्रेणी',
    showing: '{{total}} पैकी {{shown}} रिक्रूटर्स दाखवत आहे',
    empty: 'कोणतेही रिक्रूटर्स सापडले नाहीत',
    table: {
      recruiter: 'रिक्रूटर',
      contact: 'संपर्क',
      stats: 'आकडेवारी',
      joined: 'सामील झाले',
    },
    stats: {
      jobs: '{{count}} नोकऱ्या',
      hiresApps: '{{hires}} नियुक्त्या · {{apps}} अर्ज',
    },
    verified: 'सत्यापित',
    thisRecruiter: 'हा रिक्रूटर',
    errors: {
      unauthorized: 'अनधिकृत — कृपया ॲडमिन म्हणून लॉग इन करा.',
      forbidden: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      notFound: 'एंडपॉइंट सापडला नाही — बॅकएंड रूट {{route}} तपासा.',
      loadFailed: 'रिक्रूटर्स लोड करता आले नाहीत.',
    },
    pagination: {
      total: 'एकूण {{total}}',
    },
  },
})
