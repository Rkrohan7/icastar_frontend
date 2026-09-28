import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    title: 'Project-wise Casting Report',
    subtitle: 'How many characters are cast in each project',
    manageProjects: 'Manage Projects →',
    loading: 'Loading report...',
    empty: 'No project-wise jobs yet.',
    emptyCta: 'Post a job for a project',
    projectFallback: 'Project #{{id}}',
    stats: {
      projects: 'Projects',
      characters: 'Characters',
      charactersCast: 'Characters Cast',
      applications: 'Applications',
    },
    chart: {
      cast: 'Cast',
      pending: 'Pending',
    },
    table: {
      project: 'Project',
      progress: 'Casting Progress',
      openJobs: 'Open Jobs',
      applications: 'Applications',
      artistsSelected: 'Artists Selected',
      hide: 'Hide',
      characters: 'Characters',
    },
    character: {
      applications: '{{count}} applications',
      noJob: 'No job posted',
      notCastYet: 'Not cast yet',
    },
  },
  mr: {
    title: 'प्रकल्पनिहाय कास्टिंग अहवाल',
    subtitle: 'प्रत्येक प्रकल्पात किती पात्रांचे कास्टिंग झाले आहे',
    manageProjects: 'प्रकल्प व्यवस्थापित करा →',
    loading: 'अहवाल लोड होत आहे...',
    empty: 'अद्याप प्रकल्पनिहाय नोकऱ्या नाहीत.',
    emptyCta: 'प्रकल्पासाठी नोकरी पोस्ट करा',
    projectFallback: 'प्रकल्प #{{id}}',
    stats: {
      projects: 'प्रकल्प',
      characters: 'पात्रे',
      charactersCast: 'कास्ट झालेली पात्रे',
      applications: 'अर्ज',
    },
    chart: {
      cast: 'कास्ट झाले',
      pending: 'प्रलंबित',
    },
    table: {
      project: 'प्रकल्प',
      progress: 'कास्टिंगची प्रगती',
      openJobs: 'खुल्या नोकऱ्या',
      applications: 'अर्ज',
      artistsSelected: 'निवडलेले कलाकार',
      hide: 'लपवा',
      characters: 'पात्रे',
    },
    character: {
      applications: '{{count}} अर्ज',
      noJob: 'नोकरी पोस्ट केलेली नाही',
      notCastYet: 'अद्याप कास्टिंग झालेले नाही',
    },
  },
})
