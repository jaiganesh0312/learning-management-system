import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, ProtectedRoute } from '@/context/AuthContext';
import { Providers } from '@/Providers';
import MainLayout from '@/layouts/MainLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ErrorBoundary } from '@/components/common';

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import VerifyOTP from '@/pages/auth/VerifyOTP';
import RoleSelection from '@/pages/auth/RoleSelection';

// Dashboards
import LearnerDashboard from '@/pages/dashboards/LearnerDashboard';
import SuperAdminDashboard from '@/pages/dashboards/SuperAdminDashboard';
import ContentCreatorDashboard from '@/pages/dashboards/ContentCreatorDashboard';
import ComplianceOfficerDashboard from '@/pages/dashboards/ComplianceDashboard';
import DepartmentManagerDashboard from '@/pages/dashboards/DepartmentManagerDashboard';
import AuditorDashboard from '@/pages/dashboards/AuditorDashboard';

// Learner Pages
import MyCourses from '@/pages/learner/MyCourses';
import MyCertificates from '@/pages/learner/MyCertificates';
import CertificateView from '@/pages/learner/CertificateView';
import CoursePlayer from '@/pages/learner/CoursePlayer';

// Course Pages
import CourseList from '@/pages/courses/CourseList';
import CourseDetail from '@/pages/courses/CourseDetail';

// Learner Assessment Pages
import TakeQuiz from '@/pages/learner/TakeQuiz';
import SubmitAssignment from '@/pages/learner/SubmitAssignment';

// Admin Pages
import UserManagement from '@/pages/admin/UserManagement';
import DepartmentManagement from '@/pages/admin/DepartmentManagement';
import RoleManagementPage from '@/pages/RoleManagementPage';
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs';
import SystemSettings from '@/pages/admin/SystemSettings';

// Content Creator Pages
import CreatorCourseList from '@/pages/creator/CreatorCourseList';
import CreateCourse from '@/pages/creator/CreateCourse';
import EditCourse from '@/pages/creator/EditCourse';
import CreatorAnalytics from '@/pages/creator/CreatorAnalytics';
import LearningPathManager from '@/pages/creator/LearningPathManager';
import CreateLearningPath from '@/pages/creator/CreateLearningPath';
import EditLearningPath from '@/pages/creator/EditLearningPath';
import GradingDashboard from '@/pages/creator/GradingDashboard';

// Compliance Officer Pages
import ComplianceDashboard from '@/pages/compliance/ComplianceDashboard';
import ComplianceReports from '@/pages/compliance/ComplianceReports';
import LearningPathManager_Compliance from '@/pages/compliance/LearningPathManager';
import ComplianceTrackingView from '@/pages/compliance/ComplianceTrackingView';
import ReminderManager from '@/pages/compliance/ReminderManager';
import AuditLogViewer from '@/pages/compliance/AuditLogViewer';
import UserAccessManager from '@/pages/compliance/UserAccessManager';

// Department Manager Pages
import TeamManagement from '@/pages/manager/TeamManagement';
import LearningPaths from '@/pages/manager/LearningPaths';
import ManagerReports from '@/pages/manager/ManagerReports';

// Auditor Pages
import AuditorLogs from '@/pages/auditor/AuditorLogs';
import AuditorComplianceView from '@/pages/auditor/AuditorComplianceView';
import SystemSettingsView from '@/pages/auditor/SystemSettingsView';

// Common Pages
import ProfilePage from '@/pages/common/ProfilePage';
import SettingsPage from '@/pages/common/SettingsPage';
import EnquiryPage from '@/pages/common/EnquiryPage';
import ChangePassword from '@/pages/common/ChangePassword';
import NotFound from '@/pages/common/NotFound';

function App() {
  return (
    <Providers>
      <ErrorBoundary>
        <Routes>
          <Route element={<MainLayout> <Outlet /></MainLayout>} >
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/select-role" element={<RoleSelection />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    {/* Dashboard Routes - Role-based */}
                    <Route path="/dashboard" element={<DashboardRouter />} />

                    {/* Learner Routes */}
                    <Route path="/my-courses" element={<MyCourses />} />
                    <Route path="/courses" element={<CourseList />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/course-player/:courseId" element={<CoursePlayer />} />
                    <Route path="/certificates" element={<MyCertificates />} />
                    <Route path="/certificates/:id" element={<CertificateView />} />

                    {/* Learner Assessment Routes */}
                    <Route path="/learner/quiz/:quizId" element={<TakeQuiz />} />
                    <Route path="/learner/assignment/:assignmentId" element={<SubmitAssignment />} />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <ProtectedRoute requiredRoles={['super_admin']}>
                          <Routes>
                            <Route path="users" element={<UserManagement />} />
                            <Route path="departments" element={<DepartmentManagement />} />
                            <Route path="roles" element={<RoleManagementPage />} />
                            <Route path="audit-logs" element={<AdminAuditLogs />} />
                            <Route path="settings" element={<SystemSettings />} />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />

                    {/* Content Creator Routes */}
                    <Route
                      path="/creator/*"
                      element={
                        <ProtectedRoute requiredRoles={['content_creator']}>
                          <Routes>
                            <Route path="courses" element={<CreatorCourseList />} />
                            <Route path="courses/create" element={<CreateCourse />} />
                            <Route path="courses/:id/edit" element={<EditCourse />} />
                            <Route path="learning-paths" element={<LearningPathManager />} />
                            <Route path="learning-paths/create" element={<CreateLearningPath />} />
                            <Route path="learning-paths/:id/edit" element={<EditLearningPath />} />
                            <Route path="grading" element={<GradingDashboard />} />
                            <Route path="analytics" element={<CreatorAnalytics />} />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />

                    {/* Compliance Officer Routes */}
                    <Route
                      path="/compliance/*"
                      element={
                        <ProtectedRoute requiredRoles={['compliance_officer']}>
                          <Routes>
                            <Route index element={<ComplianceDashboard />} />
                            <Route path="reports" element={<ComplianceReports />} />
                            <Route path="learning-paths" element={<LearningPathManager_Compliance />} />
                            <Route path="tracking" element={<ComplianceTrackingView />} />
                            <Route path="reminders" element={<ReminderManager />} />
                            <Route path="audit-logs" element={<AuditLogViewer />} />
                            <Route path="users" element={<UserAccessManager />} />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />

                    {/* Department Manager Routes */}
                    <Route
                      path="/manager/*"
                      element={
                        <ProtectedRoute requiredRoles={['department_manager']}>
                          <Routes>
                            <Route path="team" element={<TeamManagement />} />
                            <Route path="learning-paths" element={<LearningPaths />} />
                            <Route path="reports" element={<ManagerReports />} />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />

                    {/* Auditor Routes */}
                    <Route
                      path="/auditor/*"
                      element={
                        <ProtectedRoute requiredRoles={['auditor']}>
                          <Routes>
                            <Route path="logs" element={<AuditorLogs />} />
                            <Route path="compliance" element={<AuditorComplianceView />} />
                            <Route path="system-settings" element={<SystemSettingsView />} />
                          </Routes>
                        </ProtectedRoute>
                      }
                    />

                    {/* Common Routes */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/enquiry" element={<EnquiryPage />} />
                    <Route path="/roles" element={<RoleManagementPage />} />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </ErrorBoundary>
    </Providers>
  );
}

// Dashboard Router - Routes to correct dashboard based on role
function DashboardRouter() {
  const { activeRole } = useAuth();

  if (!activeRole) {
    return <LoadingSpinner fullPage />;
  }

  switch (activeRole.name) {
    case 'learner':
      return <LearnerDashboard />;
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'content_creator':
      return <ContentCreatorDashboard />;
    case 'compliance_officer':
      return <ComplianceOfficerDashboard />;
    case 'department_manager':
      return <DepartmentManagerDashboard />;
    case 'auditor':
      return <AuditorDashboard />;
    default:
      return <LearnerDashboard />;
  }
}

export default App;


