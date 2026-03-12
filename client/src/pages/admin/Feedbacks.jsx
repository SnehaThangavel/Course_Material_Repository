import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { Star, MessageSquare, BookOpen, Clock } from 'lucide-react';

const Feedbacks = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/courses')
            .then(res => setCourses(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const allReviews = courses.reduce((acc, course) => {
        if (course.reviews) {
            course.reviews.forEach(rev => {
                acc.push({ ...rev, courseTitle: course.title, courseId: course._id });
            });
        }
        return acc;
    }, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '5rem', paddingTop: '1rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.5rem' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Sentiment Repository</h1>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>Analyzing academic impact and student satisfaction across the ecosystem.</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aggregate Merit</div>
                        <div style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', gap: '0.1rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />
                                ))}
                            </div>
                            <span style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1.25rem' }}>
                                {allReviews.length > 0
                                    ? (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)
                                    : '0.0'}
                            </span>
                        </div>
                    </div>
                </header>

                {loading ? <div style={{ padding: '6rem 0' }}><Loader size={40} /></div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {allReviews.length > 0 ? allReviews.map((rev, idx) => (
                            <Card key={idx} style={{ padding: '2.5rem', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden' }} className="hover:translate-y-[-4px] hover:border-primary-light">
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: rev.rating >= 4 ? 'var(--success)' : rev.rating <= 2 ? 'var(--danger)' : 'var(--warning)' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--primary)', fontSize: '1.25rem' }}>
                                            {rev.courseTitle?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Academic Module</div>
                                            <h4 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.15rem' }}>{rev.courseTitle}</h4>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={18} style={{ fill: i < rev.rating ? 'var(--warning)' : 'none', color: i < rev.rating ? 'var(--warning)' : '#e2e8f0' }} />
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 700 }}>
                                            <Clock size={14} /> {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg)', padding: '1.75rem', borderRadius: '20px', border: '1px solid var(--border)', position: 'relative' }}>
                                    <MessageSquare size={24} style={{ position: 'absolute', top: '-12px', left: '20px', color: 'var(--primary)', background: 'white', padding: '0 8px' }} />
                                    <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic', margin: 0 }}>
                                        "{rev.comment}"
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '0 0.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                                        {rev.user?.name?.charAt(0) || 'S'}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{rev.user?.name || 'Researcher'}</span>
                                </div>
                            </Card>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'white', borderRadius: '32px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                                    <MessageSquare size={40} />
                                </div>
                                <div style={{ maxWidth: '400px' }}>
                                    <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Submissions Found</h3>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>The feedback repository is currently empty. Direct your students to the feedback portal to begin capturing insights.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout >
    );
};

export default Feedbacks;
