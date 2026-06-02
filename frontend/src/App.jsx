import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/global.css';

import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, AdminRoute } from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';

// User pages
import LoginPage       from './pages/user/LoginPage';
import RegisterPage    from './pages/user/RegisterPage';
import HomePage        from './pages/user/HomePage';
import ProfilePage     from './pages/user/ProfilePage';
import VocabListPage   from './pages/user/VocabListPage';
import VocabTopicPage  from './pages/user/VocabTopicPage';
import VocabStudyPage  from './pages/user/VocabStudyPage';
import MyVocabSetsPage from './pages/user/MyVocabSetsPage';
import GrammarListPage   from './pages/user/GrammarListPage';
import GrammarLessonPage  from './pages/user/GrammarLessonPage';
import GrammarSectionPage from './pages/user/GrammarSectionPage';
import HistoryPage     from './pages/user/HistoryPage';
import ToeicListPage   from './pages/user/ToeicListPage';
import ToeicTestPage   from './pages/user/ToeicTestPage';
import ToeicResultPage    from './pages/user/ToeicResultPage';
import VerifyEmailPage    from './pages/user/VerifyEmailPage';

// Admin pages
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminVocabPage   from './pages/admin/AdminVocabPage';
import AdminGrammarPage from './pages/admin/AdminGrammarPage';
import AdminToeicPage   from './pages/admin/AdminToeicPage';
import AdminUsersPage   from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/verify-email"  element={<VerifyEmailPage />} />

          {/* User (authenticated) */}
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          <Route path="/vocab"            element={<PrivateRoute><VocabListPage /></PrivateRoute>} />
          <Route path="/vocab/my-sets"   element={<PrivateRoute><MyVocabSetsPage /></PrivateRoute>} />
          <Route path="/vocab/:id"       element={<PrivateRoute><VocabTopicPage /></PrivateRoute>} />
          <Route path="/vocab/:id/study" element={<PrivateRoute><VocabStudyPage /></PrivateRoute>} />

          <Route path="/grammar"                           element={<PrivateRoute><GrammarListPage /></PrivateRoute>} />
          <Route path="/grammar/:id"                       element={<PrivateRoute><GrammarLessonPage /></PrivateRoute>} />
          <Route path="/grammar/:lessonId/section/:sectionId" element={<PrivateRoute><GrammarSectionPage /></PrivateRoute>} />

          <Route path="/toeic"                   element={<PrivateRoute><ToeicListPage /></PrivateRoute>} />
          <Route path="/toeic/result/:attemptId" element={<PrivateRoute><ToeicResultPage /></PrivateRoute>} />
          <Route path="/toeic/:id"               element={<PrivateRoute><ToeicTestPage /></PrivateRoute>} />

          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin"         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users"   element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/vocab"   element={<AdminRoute><AdminVocabPage /></AdminRoute>} />
          <Route path="/admin/grammar" element={<AdminRoute><AdminGrammarPage /></AdminRoute>} />
          <Route path="/admin/toeic"  element={<AdminRoute><AdminToeicPage /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
