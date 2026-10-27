import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import FacultyProfile from './pages/FacultyProfile';
import FacultyDirectory from './pages/FacultyDirectory';
import Facilities from './pages/Facilities';
import PublicationList from './pages/PublicationList';
import PublicationForm from './pages/PublicationForm';
import PublicationDetail from './pages/PublicationDetail';
import PublicationReviewQueue from './pages/PublicationReviewQueue';
import Achievements from './pages/Achievements';
import ResearchProjects from './pages/ResearchProjects';
import AdvancementTracker from './pages/AdvancementTracker';
import GenerateSummary from './pages/GenerateSummary';
import ReportHistory from './pages/ReportHistory';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import UserSettings from './pages/UserSettings';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdvancementPolicies from './pages/admin/AdvancementPolicies';
import AuditLogs from './pages/admin/AuditLogs';

// Fallbacks
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/common/LoadingSpinner';

// Route Guard: Requires Authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner text="Authenticating user session..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Route Guard: Requires Specific Roles
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner text="Checking authorization..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Portal Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<FacultyProfile />} />
        <Route path="/profile/:id" element={<FacultyProfile />} />
        <Route path="/faculty" element={<FacultyDirectory />} />
        <Route path="/facilities" element={<Facilities />} />

        {/* Publications */}
        <Route path="/publications" element={<PublicationList />} />
        <Route path="/publications/new" element={<PublicationForm />} />
        <Route path="/publications/:id" element={<PublicationDetail />} />
        <Route path="/publications/:id/edit" element={<PublicationForm />} />

        {/* Review Queue (Reviewers & Admins) */}
        <Route
          path="/reviews"
          element={
            <RoleRoute allowedRoles={['reviewer', 'admin']}>
              <PublicationReviewQueue />
            </RoleRoute>
          }
        />

        {/* Professional Development & Projects */}
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/research-projects" element={<ResearchProjects />} />

        {/* Career Advancement & Reports */}
        <Route path="/advancement-tracker" element={<AdvancementTracker />} />
        <Route path="/generate-summary" element={<GenerateSummary />} />
        <Route path="/reports/history" element={<ReportHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<UserSettings />} />

        {/* Admin-only Management Routes */}
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminUsers />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDepartments />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/policy"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdvancementPolicies />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AuditLogs />
            </RoleRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
