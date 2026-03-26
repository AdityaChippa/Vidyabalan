import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import AskAI from './pages/AskAI'
import BookOverview from './pages/BookOverview'
import StudyPlan from './pages/StudyPlan'
import Quiz from './pages/Quiz'
import Progress from './pages/Progress'
import Analytics from './pages/Analytics'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ChapterLearn from './pages/ChapterLearn'
import Evaluate from './pages/Evaluate'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/ask" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
      <Route path="/book/:textbookId" element={<ProtectedRoute><BookOverview /></ProtectedRoute>} />
      <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><ChapterLearn /></ProtectedRoute>} />
      <Route path="/evaluate" element={<ProtectedRoute><Evaluate /></ProtectedRoute>} />
    </Routes>
  )
}
