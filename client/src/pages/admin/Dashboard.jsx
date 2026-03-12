import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { BookOpen, Layers, Star, PlusCircle, FileText, TrendingUp, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalCourses: 0, activeCourses: 0, studentsEnrolled: 0, systemSatisfaction: "0.0" });
    const [loading, setLoading] = useState(true);
    const [popularCourses, setPopularCourses] = useState([]);

    useEffect(() => {
        axios.get('/api/courses/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));

        axios.get('/api/courses')
            .then(res => setPopularCourses(res.data.slice(0, 3)))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const draftCourses = stats.totalCourses - stats.activeCourses;

    if (loading) return <AdminLayout><Loader size={40} /></AdminLayout>;

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem', paddingTop: '1rem' }}>
                <div style={{ padding: '0 0.5rem' }}>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Management Console</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>Principal Oversight & Resource Orchestration</p>
                </div>

                <div className="grid-3" style={{ gap: '1.5rem' }}>
                    <Link to="/admin/courses" style={{ textDecoration: 'none' }}>
                        <Card style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} className="hover:translate-y-[-4px] hover:border-primary-light">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookOpen size={24} />
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', background: 'rgba(52, 211, 153, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <TrendingUp size={12} /> Live
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-1px' }}>{stats.activeCourses || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Active Curriculum Modules</div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/courses?filter=draft" style={{ textDecoration: 'none' }}>
                        <Card style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} className="hover:translate-y-[-4px] hover:border-accent-light">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Layers size={24} />
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', background: 'var(--bg)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                                    Awaiting QA
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-1px' }}>{draftCourses >= 0 ? draftCourses : 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Underground Preparations</div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/admin/feedbacks" style={{ textDecoration: 'none' }}>
                        <Card style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} className="hover:translate-y-[-4px] hover:border-warning-light">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Star size={24} />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--warning)', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-1px' }}>{stats.systemSatisfaction || "0.0"}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600 }}>Sentiment Satisfaction Index</div>
                            </div>
                        </Card>
                    </Link>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
                        <div style={{ width: '8px', height: '28px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                        <h3 className="section-title" style={{ margin: 0 }}>Strategic Operations</h3>
                    </div>

                    <div className="grid-2" style={{ gap: '1.5rem' }}>
                        <Link to="/admin/add-course" style={{ textDecoration: 'none' }}>
                            <Card style={{ padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', transition: 'all 0.4s' }} className="hover:translate-x-1 hover:border-primary-light">
                                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' }}>
                                    <PlusCircle size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Curate Curriculum</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5, margin: 0 }}>Initialize and deploy new academic resource modules.</p>
                                </div>
                            </Card>
                        </Link>
                        <Link to="/admin/courses" style={{ textDecoration: 'none' }}>
                            <Card style={{ padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', transition: 'all 0.4s' }} className="hover:translate-x-1 hover:border-accent-light">
                                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(139, 92, 246, 0.2)' }}>
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Library Auditor</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5, margin: 0 }}>Review and synchronize your global material repository.</p>
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid var(--border)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                        <h3 className="section-title" style={{ marginBottom: 0 }}>High-Performance Curriculum</h3>
                        <Link to="/admin/courses" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.5rem 1rem', background: 'var(--primary-light)', borderRadius: '12px' }}>
                            View All Assets <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {popularCourses.length > 0 ? popularCourses.map((course, idx) => (
                            <Link key={course._id} to={`/admin/edit-course/${course._id}`} style={{ textDecoration: 'none' }}>
                                <div
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        gap: '2rem',
                                        alignItems: 'center',
                                        borderRadius: '20px',
                                        transition: 'all 0.2s',
                                        border: '1px solid transparent'
                                    }}
                                    className="hover:bg-slate-50 hover:border-slate-100">
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-light)', width: '2rem' }}>0{idx + 1}</div>
                                    <div style={{ width: '60px', height: '60px', background: 'var(--bg)', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                                        {course.coverImage ? <img src={course.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}><BookOpen size={24} /></div>}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.35rem' }}>{course.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'var(--bg)', borderRadius: '6px' }}>{course.courseCode}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800 }}>{course.level} Complexity</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--bg)', color: 'var(--text-light)' }}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                <p style={{ fontWeight: 600, fontSize: '1rem' }}>No modules currently assigned to active curriculum.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
