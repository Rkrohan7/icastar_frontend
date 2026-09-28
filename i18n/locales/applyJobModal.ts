import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    title: 'Apply for {{title}}',
    titleFallback: 'Apply for Job',
    coverLetter: 'Cover Letter',
    coverLetterPlaceholder: 'Write a brief cover letter...',
    expectedSalary: 'Expected Salary',
    expectedSalaryPlaceholder: 'e.g., 7530.12',
    validation: {
      coverLetterTooShort: 'Please write at least 10 characters in your cover letter.',
      invalidSalary: 'Please enter a valid expected salary greater than 0.',
    },
    toast: {
      success: 'Applied to {{title}} successfully',
      successFallback: 'Applied to job successfully',
      failed: 'Failed to submit application',
    },
  },
  mr: {
    title: '{{title}} साठी अर्ज करा',
    titleFallback: 'नोकरीसाठी अर्ज करा',
    coverLetter: 'कव्हर लेटर',
    coverLetterPlaceholder: 'थोडक्यात कव्हर लेटर लिहा...',
    expectedSalary: 'अपेक्षित पगार',
    expectedSalaryPlaceholder: 'उदा. 7530.12',
    validation: {
      coverLetterTooShort: 'कृपया तुमच्या कव्हर लेटरमध्ये किमान 10 अक्षरे लिहा.',
      invalidSalary: 'कृपया 0 पेक्षा जास्त असलेला वैध अपेक्षित पगार प्रविष्ट करा.',
    },
    toast: {
      success: '{{title}} साठी यशस्वीरित्या अर्ज केला',
      successFallback: 'नोकरीसाठी यशस्वीरित्या अर्ज केला',
      failed: 'अर्ज सबमिट करता आला नाही',
    },
  },
})
