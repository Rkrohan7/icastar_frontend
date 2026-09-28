import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    changeStatusTitle: 'Change account status',
    reasonPrompt: 'Reason for marking {{name}} as {{status}} (optional):',
    statusChanged: '{{name}} is now {{status}}',
    statusUpdateFailed: 'Failed to update status',
    deleted: '{{name}} deleted',
    deleteFailed: 'Failed to delete account',
    kinds: {
      artist: 'artist',
      recruiter: 'recruiter',
    },
    deleteTitle: 'Delete this {{kind}}?',
    deleteBody: {
      before: '',
      after:
        ' will be removed along with their profile data. This cannot be undone — to only block sign-in, set the status to Inactive instead.',
    },
    reasonPlaceholder: 'Reason (optional, stored in the admin log)',
  },
  mr: {
    changeStatusTitle: 'खात्याची स्थिती बदला',
    reasonPrompt: '{{name}} यांना {{status}} म्हणून चिन्हांकित करण्याचे कारण (ऐच्छिक):',
    statusChanged: '{{name}} आता {{status}} आहे',
    statusUpdateFailed: 'स्थिती अपडेट करता आली नाही',
    deleted: '{{name}} हटवले',
    deleteFailed: 'खाते हटवता आले नाही',
    kinds: {
      artist: 'कलाकार',
      recruiter: 'रिक्रूटर',
    },
    deleteTitle: 'हा {{kind}} हटवायचा?',
    deleteBody: {
      before: '',
      after:
        ' आणि त्यांचा प्रोफाइल डेटा काढून टाकला जाईल. ही क्रिया पूर्ववत करता येणार नाही — फक्त साइन इन रोखायचे असल्यास, त्याऐवजी स्थिती निष्क्रिय करा.',
    },
    reasonPlaceholder: 'कारण (ऐच्छिक, ॲडमिन लॉगमध्ये जतन केले जाते)',
  },
})
