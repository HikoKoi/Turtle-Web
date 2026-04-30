import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/Auth/AuthPage';
import WorkspacePage from './pages/Workspace/WorkspacePage';
import ProfilePage from './pages/Profile/ProfilePage';
import WikiPage from './pages/Wiki/WikiPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        {/* Trang chính IDE - Cho phép khách xem Playground */}
        <Route path="/" element={<WorkspacePage />} />

        {/* Trang Hồ sơ Hiệp sĩ - Bắt buộc đăng nhập */}
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* Trang Wiki Tra cứu - Cho phép khách xem */}
        <Route path="/wiki" element={<WikiPage />} />

        {/* Trang 404 cho tất cả các đường dẫn lạ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
