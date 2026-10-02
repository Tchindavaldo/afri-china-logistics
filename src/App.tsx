import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import SettingsProvider from './context/SettingsProvider';
import PublicLayout from './components/layout/PublicLayout';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/Spinner';
import Home from './pages/Home';

// Le site vitrine se charge vite ; le suivi (globe 3D), l'admin et l'espace
// client sont découpés en morceaux séparés.
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Network = lazy(() => import('./pages/Network'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Terms = lazy(() => import('./pages/TermsAndConditions'));
const Track = lazy(() => import('./pages/Track'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/admin/Admin'));

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/network" element={<Network />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/track" element={<Track />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/terms-and-conditions" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Pas de lien public : on y arrive par /admin (ou /dashboard) sans être connecté. */}
              <Route path="/auth" element={<Login />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="client">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
