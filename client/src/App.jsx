import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/CreateLayout/Layout';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageCourses from './pages/Admin/ManageCourses';
import ManageStudents from './pages/Admin/ManageStudents';
import AdminStudentDetail from './pages/Admin/AdminStudentDetail';
import ManageMaterials from './pages/Admin/ManageMaterials';
import AddCourse from './pages/Admin/AddCourse';
import EditCourse from './pages/Admin/EditCourse';
import AdminProfile from './pages/Admin/AdminProfile';
import CourseReviews from './pages/Admin/CourseReviews';
import CourseConfig from './pages/Admin/CourseConfig';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import CourseList from './pages/Student/CourseList';
import CourseDetail from './pages/Student/CourseDetail';
import StudentProgress from './pages/Student/StudentProgress';
import StudentProfile from './pages/Student/StudentProfile';
import SearchResults from './pages/Student/SearchResults';
import ViewProgress from './pages/Student/ViewProgress';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<ProtectedRoute role="admin" />}>
                        <Route element={<Layout />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="courses" element={<ManageCourses />} />
                            <Route path="students" element={<ManageStudents />} />
                            <Route path="student/:id" element={<AdminStudentDetail />} />
                            <Route path="materials" element={<ManageMaterials />} />
                            <Route path="add-course" element={<AddCourse />} />
                            <Route path="edit-course/:id" element={<EditCourse />} />
                            <Route path="profile" element={<AdminProfile />} />
                            <Route path="reviews" element={<CourseReviews />} />
                            <Route path="course-config/:id" element={<CourseConfig />} />
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        </Route>
                    </Route>

                    {/* Student Routes */}
                    <Route path="/student" element={<ProtectedRoute role="student" />}>
                        <Route element={<Layout />}>
                            <Route path="dashboard" element={<StudentDashboard />} />
                            <Route path="courses" element={<CourseList />} />
                            <Route path="course/:id" element={<CourseDetail />} />
                            <Route path="progress" element={<StudentProgress />} />
                            <Route path="profile" element={<StudentProfile />} />
                            <Route path="search" element={<SearchResults />} />
                            <Route path="view-progress" element={<ViewProgress />} />
                            <Route index element={<Navigate to="/student/dashboard" replace />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
