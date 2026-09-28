import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    title: 'Saved Jobs',
    subtitle: 'Your personally curated list of opportunities.',
    activeOnly: 'Show only active jobs',
    card: {
      locationFallback: 'Remote / Not specified',
      removeTitle: 'Remove Bookmark',
      experienceFallback: 'Not Specified',
      jobTypeFallback: 'Full-time',
      totalApplicants: 'Total Applicants',
      bookmarkedDate: 'Bookmarked Date',
      myNotes: 'My Notes',
      showLess: 'SHOW LESS',
      readMore: 'READ MORE',
    },
    removeDialog: {
      title: 'Remove Bookmark?',
      description: 'Are you sure you want to remove this job from your saved jobs?',
    },
    empty: {
      title: 'You haven’t bookmarked any jobs yet.',
      activeOnlyHint: "Try turning off the 'Active only' filter.",
      exploreHint: 'Start exploring jobs and save the ones you love!',
    },
    toast: {
      sessionExpired: 'Session expired. Please login again.',
      loadFailed: 'Failed to load bookmarks. Please try again.',
      removed: 'Bookmark removed',
      removeFailed: 'Failed to remove bookmark',
    },
  },
  mr: {
    title: 'जतन केलेल्या नोकऱ्या',
    subtitle: 'तुम्ही स्वतः निवडलेल्या संधींची यादी.',
    activeOnly: 'फक्त सक्रिय नोकऱ्या दाखवा',
    card: {
      locationFallback: 'रिमोट / नमूद केलेले नाही',
      removeTitle: 'बुकमार्क काढा',
      experienceFallback: 'नमूद केलेले नाही',
      jobTypeFallback: 'पूर्णवेळ',
      totalApplicants: 'एकूण अर्जदार',
      bookmarkedDate: 'बुकमार्क केल्याची तारीख',
      myNotes: 'माझ्या नोंदी',
      showLess: 'कमी दाखवा',
      readMore: 'अधिक वाचा',
    },
    removeDialog: {
      title: 'बुकमार्क काढायचा?',
      description: 'तुम्हाला खात्री आहे की तुम्ही ही नोकरी तुमच्या जतन केलेल्या नोकऱ्यांमधून काढू इच्छिता?',
    },
    empty: {
      title: 'तुम्ही अद्याप कोणतीही नोकरी बुकमार्क केलेली नाही.',
      activeOnlyHint: "'फक्त सक्रिय' फिल्टर बंद करून पहा.",
      exploreHint: 'नोकऱ्या शोधायला सुरुवात करा आणि आवडलेल्या जतन करा!',
    },
    toast: {
      sessionExpired: 'सत्र संपले आहे. कृपया पुन्हा लॉग इन करा.',
      loadFailed: 'बुकमार्क्स लोड करता आले नाहीत. कृपया पुन्हा प्रयत्न करा.',
      removed: 'बुकमार्क काढला',
      removeFailed: 'बुकमार्क काढता आला नाही',
    },
  },
})
