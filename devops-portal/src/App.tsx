import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ModulesPage from './pages/ModulesPage'
import ModulePage from './pages/ModulePage'
import LessonPage from './pages/LessonPage'
import TerminalPage from './pages/TerminalPage'
import ReferencePage from './pages/ReferencePage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="modules" element={<ModulesPage />} />
        <Route path="modules/:moduleSlug" element={<ModulePage />} />
        <Route path="modules/:moduleSlug/:lessonSlug" element={<LessonPage />} />
        <Route path="terminal" element={<TerminalPage />} />
        <Route path="reference" element={<ReferencePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
