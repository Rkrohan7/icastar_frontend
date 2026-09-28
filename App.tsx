import React from 'react'
import { RouterProvider } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import { ToastContainer } from 'react-toastify'
import { LanguageProvider } from './i18n'

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar
        aria-label={undefined}
      />
      <RouterProvider router={AppRouter()} />
    </LanguageProvider>
  )
}

export default App
