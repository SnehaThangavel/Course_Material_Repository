import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', code: '' });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (e) {
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/courses', form);
            setForm({ title: '', description: '', code: '' });
            setShowForm(false);
            setMsg('Course created successfully!');
            fetchCourses();
        } catch (e) {
            setMsg(e.response?.data?.message || 'Failed to create course.');
        } finally {
            setSubmitting(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const togglePublish = async (course) => {
        try {
            await api.put(`/courses/${course._id}`, { isPublished: !course.isPublished });
            setCourses(courses.map(c => c._id === course._id ? { ...c, isPublished: !c.isPublished } : c));
        } catch (e) {
            alert('Failed to update course visibility.');
        }
    };

    const deleteCourse = async (id) => {
        if (!confirm('Delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c._id !== id));
        } catch (e) {
            alert('Failed to delete course.');
        }
    };

    return (
        <div className="dashboard-bg">
            <nav className="navbar">
                <div className="nav-brand">📚 CourseHub <span className="badge badge-admin">Admin</span></div>
                <div className="nav-right">
                    <span className="nav-user">👤 {user?.name}</span>
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2 className="dashboard-title">Course Management</h2>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? '✕ Cancel' : '+ Add Course'}
                    </button>
                </div>

                {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

                {showForm && (
                    <div className="card form-card">
                        <h3 className="form-title">New Course</h3>
                        <form onSubmit={handleCreate} className="course-form">
                            <input
                                className="input-field"
                                placeholder="Course Title *"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                            />
                            <input
                                className="input-field"
                                placeholder="Course Code (e.g. CS101)"
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value })}
                            />
                            <textarea
                                className="input-field textarea"
                                placeholder="Course Description"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={3}
                            />
                            <button type="submit" disabled={submitting} className="btn-primary">
                                {submitting ? 'Creating...' : 'Create Course'}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">Loading courses...</div>
                ) : error ? (
                    <div className="alert alert-error">{error}</div>
                ) : courses.length === 0 ? (
                    <div className="empty-state">
                        <p>No courses yet. Click <strong>+ Add Course</strong> to create one.</p>
                    </div>
                ) : (
                    <div className="course-grid">
                        {courses.map(course => (
                            <div key={course._id} className="course-card">
                                <div className="course-card-header">
                                    <div>
                                        <h3 className="course-card-title">{course.title}</h3>
                                        {course.code && <span className="course-code">{course.code}</span>}
                                    </div>
                                    <span className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                                        {course.isPublished ? '✔ Published' : '● Draft'}
                                    </span>
                                </div>
                                {course.description && <p className="course-desc">{course.description}</p>}
                                <div className="course-card-actions">
                                    <button
                                        onClick={() => togglePublish(course)}
                                        className={`btn-sm ${course.isPublished ? 'btn-warning' : 'btn-success'}`}
                                    >
                                        {course.isPublished ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button onClick={() => deleteCourse(course._id)} className="btn-sm btn-danger">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
