import { defineMessages } from '../defineMessages'

export default defineMessages({
  en: {
    searchPlaceholder: 'Search categories...',
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    count: '{{count}} categories',
    empty: 'No categories found',
    artists: '{{count}} artists',
    order: 'Order: {{order}}',
    confirmDelete: 'Delete category "{{name}}"?',
    fields: {
      nameSlug: 'Name (slug) *',
      displayName: 'Display Name *',
      iconUrl: 'Icon URL',
      sortOrder: 'Sort Order',
    },
    errors: {
      unauthorized: 'Unauthorized — log in as admin.',
      accessDenied: 'Access denied — admin role required.',
      loadFailed: 'Unable to load categories.',
      deleteFailed: 'Failed to delete',
      saveFailed: 'Failed to save',
    },
  },
  mr: {
    searchPlaceholder: 'श्रेण्या शोधा...',
    addCategory: 'श्रेणी जोडा',
    editCategory: 'श्रेणी संपादित करा',
    count: '{{count}} श्रेण्या',
    empty: 'कोणत्याही श्रेण्या सापडल्या नाहीत',
    artists: '{{count}} कलाकार',
    order: 'क्रम: {{order}}',
    confirmDelete: '"{{name}}" ही श्रेणी हटवायची?',
    fields: {
      nameSlug: 'नाव (स्लग) *',
      displayName: 'प्रदर्शित नाव *',
      iconUrl: 'आयकॉन URL',
      sortOrder: 'क्रमवारी क्रमांक',
    },
    errors: {
      unauthorized: 'अनधिकृत — ॲडमिन म्हणून लॉग इन करा.',
      accessDenied: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      loadFailed: 'श्रेण्या लोड करता आल्या नाहीत.',
      deleteFailed: 'हटवता आले नाही',
      saveFailed: 'जतन करता आले नाही',
    },
  },
})
