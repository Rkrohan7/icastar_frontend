import { defineMessages } from '../defineMessages'

// Screen-reader / aria text inside the shadcn primitives in components/ui.
// "Close", "Previous", "Next" and "More pages" reuse common.* keys.
export default defineMessages({
  en: {
    pagination: 'pagination',
    goToPreviousPage: 'Go to previous page',
    goToNextPage: 'Go to next page',
    breadcrumb: 'breadcrumb',
    more: 'More',
    previousSlide: 'Previous slide',
    nextSlide: 'Next slide',
    toggleSidebar: 'Toggle Sidebar',
  },
  mr: {
    pagination: 'पान नेव्हिगेशन',
    goToPreviousPage: 'मागील पानावर जा',
    goToNextPage: 'पुढील पानावर जा',
    breadcrumb: 'ब्रेडक्रम्ब',
    more: 'अधिक',
    previousSlide: 'मागील स्लाइड',
    nextSlide: 'पुढील स्लाइड',
    toggleSidebar: 'साइडबार उघडा/बंद करा',
  },
})
