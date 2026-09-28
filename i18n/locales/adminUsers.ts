import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    searchPlaceholder: 'Search by name or email...',
    allStatuses: 'All Statuses',
    addAdmin: 'Add Admin',
    showing: 'Showing {{shown}} of {{total}} admin users',
    empty: 'No admin users found',
    table: {
      admin: 'Admin',
      contact: 'Contact',
      permissions: 'Permissions',
      lastLogin: 'Last Login',
    },
    id: 'ID: {{id}}',
    never: 'Never',
    actions: {
      suspend: 'Suspend',
      activate: 'Activate',
    },
    confirm: {
      changeStatus: 'Change status to {{status}}?',
      delete: 'Delete admin "{{name}}"?',
    },
    modal: {
      editTitle: 'Edit Admin',
      addTitle: 'Add Admin',
      initialPassword: 'Initial Password',
      passwordPlaceholder: 'Leave blank to auto-generate',
    },
    errors: {
      unauthorized: 'Unauthorized — please log in as an admin.',
      forbidden: 'Access denied — admin role required.',
      notFound: 'Endpoint not found.',
      loadFailed: 'Unable to load admin users.',
      statusFailed: 'Failed to update status',
      deleteFailed: 'Failed to delete',
      saveFailed: 'Failed to save',
    },
  },
  mr: {
    searchPlaceholder: 'नाव किंवा ईमेलने शोधा...',
    allStatuses: 'सर्व स्थिती',
    addAdmin: 'ॲडमिन जोडा',
    showing: '{{total}} पैकी {{shown}} ॲडमिन वापरकर्ते दाखवत आहे',
    empty: 'कोणतेही ॲडमिन वापरकर्ते सापडले नाहीत',
    table: {
      admin: 'ॲडमिन',
      contact: 'संपर्क',
      permissions: 'परवानग्या',
      lastLogin: 'शेवटचे लॉग इन',
    },
    id: 'ID: {{id}}',
    never: 'कधीही नाही',
    actions: {
      suspend: 'निलंबित करा',
      activate: 'सक्रिय करा',
    },
    confirm: {
      changeStatus: 'स्थिती बदलून "{{status}}" करायची का?',
      delete: 'ॲडमिन "{{name}}" हटवायचे का?',
    },
    modal: {
      editTitle: 'ॲडमिन संपादित करा',
      addTitle: 'ॲडमिन जोडा',
      initialPassword: 'सुरुवातीचा पासवर्ड',
      passwordPlaceholder: 'आपोआप तयार करण्यासाठी रिकामे सोडा',
    },
    errors: {
      unauthorized: 'अनधिकृत — कृपया ॲडमिन म्हणून लॉग इन करा.',
      forbidden: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      notFound: 'एंडपॉइंट सापडला नाही.',
      loadFailed: 'ॲडमिन वापरकर्ते लोड करता आले नाहीत.',
      statusFailed: 'स्थिती अपडेट करता आली नाही',
      deleteFailed: 'हटवता आले नाही',
      saveFailed: 'जतन करता आले नाही',
    },
  },
})
