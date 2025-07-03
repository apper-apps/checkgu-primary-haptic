import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from '@/components/organisms/Layout'
import HomePage from '@/components/pages/HomePage'
import UploadPage from '@/components/pages/UploadPage'
import CalendarPage from '@/components/pages/CalendarPage'
import SchedulePage from '@/components/pages/SchedulePage'
import RecentFilesPage from '@/components/pages/RecentFilesPage'
import LessonPlansPage from '@/components/pages/LessonPlansPage'
import SettingsPage from '@/components/pages/SettingsPage'
import TemplatesPage from '@/components/pages/TemplatesPage'
function App() {
  return (
    <>
      <Layout>
<Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
<Route path="/recent" element={<RecentFilesPage />} />
          <Route path="/lesson-plans" element={<LessonPlansPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
        </Routes>
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  )
}

export default App