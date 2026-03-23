import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { BookA, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MyCourses = () => {
    const location = useLocation();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Get filter from URL
    const queryParams = new URLSearchParams(location.search);
    const filterParam = queryParams.get('filter');
    const initialTab = filterParam === 'completed' ? 'completed' : 'registered';
    
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const { data } = await axios.get('/api/mycourses');
                setEnrollments(data || []);
            } catch {
                toast.error('Failed to fetch courses');
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, []);

    const visibleEnrollments = enrollments.filter(e => {
        if (!e.courseId) return false;
        // If course has levels, only show levelNumber > 0
        if (e.courseId.levels && e.courseId.levels.length > 0) {
            return e.levelNumber > 0;
        }
        // If course has no levels, show levelNumber === 0
        return e.levelNumber === 0;
    });

    const activeEnrollments = visibleEnrollments.filter(e => !e.completed);
    const completedEnrollments = visibleEnrollments.filter(e => e.completed);

    const tabBtn = (tab) => ({
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1.25rem',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.875rem',
        transition: 'all 0.2s',
        background: activeTab === tab ? 'var(--primary)' : 'transparent',
        color: activeTab === tab ? '#fff' : 'var(--text-muted)',
    });

    const getCourseTitle = (enrollment) => {
        const base = enrollment.courseId?.title || 'Unknown Course';
        if (enrollment.levelNumber && enrollment.levelNumber > 0) {
            return `${base} – Level ${enrollment.levelNumber}`;
        }
        // If levelNumber is 0, it's the main course, also labeled as Level 1
        return `${base} – Level 1`;
    };

    const getContinueLearningLink = (enrollment) => {
        const courseId = enrollment.courseId?._id;
        if (!courseId) return null;
        if (enrollment.levelNumber && enrollment.levelNumber > 0) {
            return `/student/course/${courseId}/level/${enrollment.levelNumber}`;
        }
        return `/student/course/${courseId}`;
    };

    const renderEnrollmentCard = (enrollment) => {
        const title = getCourseTitle(enrollment);
        const progress = enrollment.progress || 0;

        return (
            <Card key={enrollment._id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem' }}>{title}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {enrollment.courseId?.skillCategory && (
                                <span className="badge badge-primary">{enrollment.courseId.skillCategory}</span>
                            )}
                            {enrollment.levelNumber > 0 ? (
                                <span className="badge" style={{ background: 'var(--surface-muted)', color: 'var(--text-main)' }}>
                                    Level {enrollment.levelNumber}
                                </span>
                            ) : (
                                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                    Level 1
                                </span>
                            )}
                        </div>
                    </div>
                    {enrollment.completed ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 800, fontSize: '0.75rem', background: '#dcfce7', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                            <CheckCircle size={14} /> COMPLETED
                        </div>
                    ) : progress > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 800, fontSize: '0.75rem', background: '#eff6ff', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span> ON GOING
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', background: 'var(--surface-muted)', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                            <Clock size={14} /> NOT STARTED
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div style={{ background: 'var(--surface-muted)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            borderRadius: '10px',
                            background: enrollment.completed ? '#22c55e' : 'var(--primary)',
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                </div>

                {!enrollment.completed && enrollment.courseId?._id && (() => {
                    const link = getContinueLearningLink(enrollment);
                    return link ? (
                        <Link to={link}>
                            <button className="btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
                                Continue Learning
                            </button>
                        </Link>
                    ) : null;
                })()}
                {enrollment.completed && enrollment.completionDate && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Completed on {new Date(enrollment.completionDate).toLocaleDateString()}
                    </div>
                )}
            </Card>
        );
    };

    return (
        <StudentLayout>
            <div>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="page-title">My Learning Library</h1>
                    <p className="page-subtitle">Track your enrolled courses and level progress</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--surface)', padding: '0.375rem', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
                    <button style={tabBtn('registered')} onClick={() => setActiveTab('registered')}>
                        <BookA size={16} />
                        Registered Courses <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '20px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{activeEnrollments.length}</span>
                    </button>
                    <button style={tabBtn('completed')} onClick={() => setActiveTab('completed')}>
                        <CheckCircle size={16} />
                        Completed <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '20px', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{completedEnrollments.length}</span>
                    </button>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <div>
                        {activeTab === 'registered' && (
                            activeEnrollments.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)' }}>
                                    <BookA size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No registered courses. <Link to="/student/discovery" style={{ color: 'var(--primary)' }}>Browse Courses</Link></p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                                    {activeEnrollments.map(renderEnrollmentCard)}
                                </div>
                            )
                        )}
                        {activeTab === 'completed' && (
                            completedEnrollments.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)' }}>
                                    <CheckCircle size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No completed courses yet. Keep learning!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                                    {completedEnrollments.map(renderEnrollmentCard)}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default MyCourses;
