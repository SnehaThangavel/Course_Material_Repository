import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import ManageCourses from './pages/admin/ManageCourses';
import AddCourse from './pages/admin/AddCourse';
import AdminProfile from './pages/admin/AdminProfile';
import Feedbacks from './pages/admin/Feedbacks';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminStudentsList from './pages/admin/AdminStudentsList';
import AdminPublishedCourses from './pages/admin/AdminPublishedCourses';
import AdminEnrollmentDetails from './pages/admin/AdminEnrollmentDetails';
import AdminCompletedDetails from './pages/admin/AdminCompletedDetails';
import StudentDashboard from './pages/student/Dashboard';
import CourseDiscovery from './pages/student/CourseDiscovery';
import MyCourses from './pages/student/MyCourses';
import CourseDetails from './pages/student/CourseDetails';
import Profile from './pages/student/Profile';
import StudentAnalytics from './pages/student/StudentAnalytics';
import LevelLearning from './pages/student/LevelLearning';


const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="center-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <div className="app-container">
        <ToastContainer position="top-right" />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />} />

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute role="admin"><ManageCourses /></ProtectedRoute>} />
          <Route path="/admin/add-course" element={<ProtectedRoute role="admin"><AddCourse /></ProtectedRoute>} />
          <Route path="/admin/edit-course/:id" element={<ProtectedRoute role="admin"><AddCourse /></ProtectedRoute>} />
          <Route path="/admin/feedbacks" element={<ProtectedRoute role="admin"><Feedbacks /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
          
          {/* New Admin Detail Routes */}
          <Route path="/admin/students-list" element={<ProtectedRoute role="admin"><AdminStudentsList /></ProtectedRoute>} />
          <Route path="/admin/published-courses" element={<ProtectedRoute role="admin"><AdminPublishedCourses /></ProtectedRoute>} />
          <Route path="/admin/enrollment-details" element={<ProtectedRoute role="admin"><AdminEnrollmentDetails /></ProtectedRoute>} />
          <Route path="/admin/completed-details" element={<ProtectedRoute role="admin"><AdminCompletedDetails /></ProtectedRoute>} />

          <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/discovery" element={<ProtectedRoute role="student"><CourseDiscovery /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute role="student"><MyCourses /></ProtectedRoute>} />
          <Route path="/student/course/:id" element={<ProtectedRoute role="student"><CourseDetails /></ProtectedRoute>} />
          <Route path="/student/course/:id/level/:levelNumber" element={<ProtectedRoute role="student"><LevelLearning /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
          <Route path="/student/analytics" element={<ProtectedRoute role="student"><StudentAnalytics /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
