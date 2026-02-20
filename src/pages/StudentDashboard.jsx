import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/courses')
            .then(({ data }) => setCourses(data))
            .catch(() => setError('Failed to load courses.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="dashboard-bg">
            <nav className="navbar">
                <div className="nav-brand">📚 CourseHub <span className="badge badge-student">Student</span></div>
                <div className="nav-right">
                    <span className="nav-user">👤 {user?.name}</span>
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2 className="dashboard-title">Available Courses</h2>
                    <input
                        className="search-input"
                        placeholder="🔍 Search courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loading-state">Loading courses...</div>
                ) : error ? (
                    <div className="alert alert-error">{error}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>{search ? 'No courses match your search.' : 'No courses available yet. Check back soon!'}</p>
                    </div>
                ) : (
                    <div className="course-grid">
                        {filtered.map(course => (
                            <div key={course._id} className="course-card student-card">
                                <div className="course-card-header">
                                    <div>
                                        <h3 className="course-card-title">{course.title}</h3>
                                        {course.code && <span className="course-code">{course.code}</span>}
                                    </div>
                                    <span className="status-badge published">Available</span>
                                </div>
                                {course.description && <p className="course-desc">{course.description}</p>}
                                <div className="course-footer">
                                    <small className="course-date">
                                        Added {new Date(course.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
