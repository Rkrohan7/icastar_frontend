import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    password: {
      title: 'Change Password',
      description:
        "For your security, we recommend using a strong password that you're not using anywhere else.",
      current: 'Current Password',
      new: 'New Password',
      confirm: 'Confirm New Password',
      update: 'Update Password',
    },
    errors: {
      currentRequired: 'Current password is required',
      newRequired: 'New password is required',
      minLength: 'Password must be at least {{count}} characters',
      confirmRequired: 'Please confirm your new password',
      mismatch: 'Passwords do not match',
      sameAsCurrent: 'New password must be different from current password',
    },
    toast: {
      passwordChanged: 'Password changed successfully',
      passwordChangeFailed: 'Failed to change password',
      saved: 'Settings saved successfully!',
    },
    emailNotifications: {
      title: 'Email Notifications',
      description: 'Manage how you receive notifications to your email address.',
      newApplicants: {
        label: 'New Applicants',
        description: 'When a new candidate applies to one of your jobs.',
      },
      directMessages: {
        label: 'Direct Messages',
        description: 'For new chat messages from artists.',
      },
      weeklySummary: {
        label: 'Weekly Summary',
        description: 'A weekly report of your job performance and applicants.',
      },
    },
    saveSettings: 'Save Settings',
  },
  mr: {
    password: {
      title: 'पासवर्ड बदला',
      description:
        'तुमच्या सुरक्षिततेसाठी, इतर कुठेही न वापरलेला मजबूत पासवर्ड वापरण्याची आम्ही शिफारस करतो.',
      current: 'सध्याचा पासवर्ड',
      new: 'नवीन पासवर्ड',
      confirm: 'नवीन पासवर्डची पुष्टी करा',
      update: 'पासवर्ड अपडेट करा',
    },
    errors: {
      currentRequired: 'सध्याचा पासवर्ड आवश्यक आहे',
      newRequired: 'नवीन पासवर्ड आवश्यक आहे',
      minLength: 'पासवर्डमध्ये किमान {{count}} अक्षरे असणे आवश्यक आहे',
      confirmRequired: 'कृपया तुमच्या नवीन पासवर्डची पुष्टी करा',
      mismatch: 'पासवर्ड जुळत नाहीत',
      sameAsCurrent: 'नवीन पासवर्ड सध्याच्या पासवर्डपेक्षा वेगळा असणे आवश्यक आहे',
    },
    toast: {
      passwordChanged: 'पासवर्ड यशस्वीरित्या बदलला',
      passwordChangeFailed: 'पासवर्ड बदलता आला नाही',
      saved: 'सेटिंग्ज यशस्वीरित्या जतन झाल्या!',
    },
    emailNotifications: {
      title: 'ईमेल सूचना',
      description: 'तुमच्या ईमेल पत्त्यावर सूचना कशा मिळाव्यात ते व्यवस्थापित करा.',
      newApplicants: {
        label: 'नवीन अर्जदार',
        description: 'जेव्हा एखादा नवीन उमेदवार तुमच्या नोकरीसाठी अर्ज करतो.',
      },
      directMessages: {
        label: 'थेट संदेश',
        description: 'कलाकारांकडून आलेल्या नवीन चॅट संदेशांसाठी.',
      },
      weeklySummary: {
        label: 'साप्ताहिक सारांश',
        description: 'तुमच्या नोकऱ्यांची कामगिरी आणि अर्जदारांचा साप्ताहिक अहवाल.',
      },
    },
    saveSettings: 'सेटिंग्ज जतन करा',
  },
})
