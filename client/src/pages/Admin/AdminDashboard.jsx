import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, FileText, PlusCircle, Activity, TrendingUp, Layers, Star } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import api from '../../services/api';
import '../../styles/pages.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        liveCourses: 0,
        draftCourses: 0,
        students: 0,
        avgRating: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [coursesRes, studentsRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/auth/users?role=student')
                ]);

                const allCourses = coursesRes.data;
                const liveCount = allCourses.filter(c => c.isPublished).length;
                const draftCount = allCourses.filter(c => !c.isPublished).length;

                const coursesWithRatings = allCourses.filter(c => c.numReviews > 0);
                const avg = coursesWithRatings.length > 0
                    ? coursesWithRatings.reduce((acc, c) => acc + c.averageRating, 0) / coursesWithRatings.length
                    : 0;

                setStats({
                    liveCourses: liveCount,
                    draftCourses: draftCount,
                    students: studentsRes.data.length,
                    avgRating: avg.toFixed(1)
                });
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="content-wrapper">Loading Management Console...</div>;

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title">Management Console</h1>
                    <p style={{ color: 'var(--text-gray)' }}>System-wide overview and administrative control center.</p>
                </div>
            </div>

            <div className="grid-4" style={{ marginBottom: '40px' }}>
                <Link to="/admin/courses?status=live" className="no-underline">
                    <Card className="stat-card clickable" style={{ borderLeft: '5px solid var(--primary-color)' }}>
                        <div className="stat-icon bg-blue-light">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>{stats.liveCourses}</h3>
                            <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.9rem' }}>Active Courses</p>
                        </div>
                    </Card>
                </Link>

                <Link to="/admin/courses?status=draft" className="no-underline">
                    <Card className="stat-card clickable" style={{ borderLeft: '5px solid #64748b' }}>
                        <div className="stat-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>{stats.draftCourses}</h3>
                            <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.9rem' }}>Draft Courses</p>
                        </div>
                    </Card>
                </Link>

                <Link to="/admin/students" className="no-underline">
                    <Card className="stat-card clickable" style={{ borderLeft: '5px solid var(--success)' }}>
                        <div className="stat-icon bg-green-light">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>{stats.students}</h3>
                            <p style={{ color: 'var(--text-gray)', margin: 0, fontSize: '0.9rem' }}>Enrolled Users</p>
                        </div>
                    </Card>
                </Link>

                <Link to="/admin/reviews" className="no-underline">
                    <Card className="stat-card clickable" style={{
                        background: 'linear-gradient(to right, #ffffff, #fffbeb)',
                        borderLeft: '5px solid #f59e0b',
                        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.08)'
                    }}>
                        <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                            <Star size={24} fill="#f59e0b" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, color: '#d97706' }}>{stats.avgRating}</h3>
                            <p style={{ color: '#92400e', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>System Satisfaction</p>
                        </div>
                    </Card>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                <section>
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={20} /> Quick Operations
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                        <Link to="/admin/add-course" className="no-underline">
                            <Card className="clickable" style={{ padding: '40px 30px', textAlign: 'center', height: '100%', transition: 'all 0.3s ease' }}>
                                <div style={{ color: 'var(--primary-color)', marginBottom: '15px' }}><PlusCircle size={40} /></div>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Create Course</div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '5px' }}>Launch new curriculum</p>
                            </Card>
                        </Link>
                        <Link to="/admin/materials" className="no-underline">
                            <Card className="clickable" style={{ padding: '40px 30px', textAlign: 'center', height: '100%', transition: 'all 0.3s ease' }}>
                                <div style={{ color: '#a855f7', marginBottom: '15px' }}><FileText size={40} /></div>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Resource Library</div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '5px' }}>Manage all shared files</p>
                            </Card>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
