import { defineMessages } from '../defineMessages'

// Public blog list and detail pages — pages/public/BlogsPage.tsx
export default defineMessages({
  en: {
    navBlog: 'Blog',
    list: {
      title: 'From the iCastar blog',
      subtitle: 'Audition tips, casting news and stories from the industry.',
      loading: 'Loading blogs...',
      empty: 'No blogs published yet. Please check back soon.',
    },
    detail: {
      notAvailable: 'This blog is not available.',
      backToAll: 'Back to all blogs',
      allBlogs: '← All blogs',
      minRead: '{{count}} min read',
    },
  },
  mr: {
    navBlog: 'ब्लॉग',
    list: {
      title: 'iCastar ब्लॉगवरून',
      subtitle: 'ऑडिशन टिप्स, कास्टिंगच्या बातम्या आणि इंडस्ट्रीतील अनुभव.',
      loading: 'ब्लॉग लोड होत आहेत...',
      empty: 'अद्याप कोणतेही ब्लॉग प्रकाशित झालेले नाहीत. कृपया लवकरच पुन्हा भेट द्या.',
    },
    detail: {
      notAvailable: 'हा ब्लॉग उपलब्ध नाही.',
      backToAll: 'सर्व ब्लॉगकडे परत जा',
      allBlogs: '← सर्व ब्लॉग',
      minRead: '{{count}} मिनिटांचे वाचन',
    },
  },
})
