import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    backToDashboard: 'Back to Dashboard',
    title: 'All Notifications',
    empty: {
      title: 'All Caught Up',
      description: 'You have no new notifications.',
    },
    // Sample notifications shown on this page (names/job titles are passed in)
    sample: {
      applicantApplied: '{{name}} applied for {{job}}.',
      jobExpiring: 'Your job post "{{job}}" is expiring soon.',
      newMessage: 'You have a new message from {{name}}.',
    },
    time: {
      minutesAgo: '{{count}}m ago',
      hoursAgo: '{{count}}h ago',
      daysAgo: '{{count}}d ago',
    },
  },
  mr: {
    backToDashboard: 'डॅशबोर्डवर परत जा',
    title: 'सर्व सूचना',
    empty: {
      title: 'सर्व सूचना पाहिल्या',
      description: 'तुमच्यासाठी कोणत्याही नवीन सूचना नाहीत.',
    },
    sample: {
      applicantApplied: '{{name}} यांनी {{job}} साठी अर्ज केला.',
      jobExpiring: 'तुमची नोकरी पोस्ट "{{job}}" लवकरच कालबाह्य होत आहे.',
      newMessage: 'तुम्हाला {{name}} यांच्याकडून नवीन संदेश आला आहे.',
    },
    time: {
      minutesAgo: '{{count}} मि. पूर्वी',
      hoursAgo: '{{count}} ता. पूर्वी',
      daysAgo: '{{count}} दि. पूर्वी',
    },
  },
})
