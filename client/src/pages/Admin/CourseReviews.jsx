import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, BookOpen, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../components/UI/Card';
import api from '../../services/api';
import '../../styles/pages.css';

const StarRating = ({ rating, size = 16 }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
            <Star
                key={star}
                size={size}
                fill={star <= Math.round(rating) ? '#f59e0b' : 'transparent'}
                color={star <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
            />
        ))}
    </div>
);

const CourseReviews = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourse, setExpandedCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                // Only keep courses that have at least one review
                setCourses(data);
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const coursesWithReviews = courses.filter(c => c.reviews && c.reviews.length > 0);
    const coursesWithoutReviews = courses.filter(c => !c.reviews || c.reviews.length === 0);

    const overallAvg = coursesWithReviews.length > 0
        ? (coursesWithReviews.reduce((acc, c) => acc + c.averageRating, 0) / coursesWithReviews.length).toFixed(1)
        : '0.0';

    const totalReviews = courses.reduce((acc, c) => acc + (c.reviews?.length || 0), 0);

    if (loading) return <div className="content-wrapper">Loading Feedback Data...</div>;

    return (
        <div className="content-wrapper">
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title">Course Ratings & Feedback</h1>
                    <p style={{ color: 'var(--text-gray)' }}>Student reviews and satisfaction scores across all courses.</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid-3" style={{ marginBottom: '40px' }}>
                <Card style={{ borderLeft: '5px solid #f59e0b', padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#fef3c7', color: '#f59e0b', borderRadius: '12px', padding: '12px', display: 'flex' }}>
                            <Star size={24} fill="#f59e0b" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{overallAvg}</h3>
                            <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.85rem' }}>Overall Rating</p>
                        </div>
                    </div>
                </Card>
                <Card style={{ borderLeft: '5px solid var(--primary-color)', padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#eff6ff', color: 'var(--primary-color)', borderRadius: '12px', padding: '12px', display: 'flex' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{totalReviews}</h3>
                            <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.85rem' }}>Total Reviews</p>
                        </div>
                    </div>
                </Card>
                <Card style={{ borderLeft: '5px solid var(--success)', padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: '#f0fdf4', color: 'var(--success)', borderRadius: '12px', padding: '12px', display: 'flex' }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{coursesWithReviews.length}</h3>
                            <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: '0.85rem' }}>Courses Reviewed</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Courses with reviews */}
            {coursesWithReviews.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Star size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--text-gray)', fontWeight: 600 }}>No feedback yet</h3>
                    <p style={{ color: 'var(--text-gray)', margin: 0 }}>Students haven't submitted any ratings for courses yet.</p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {coursesWithReviews.map(course => (
                        <Card key={course._id} style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            {/* Course Header */}
                            <div
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '20px 25px', cursor: 'pointer', background: expandedCourse === course._id ? '#f8fafc' : '#fff',
                                    borderBottom: expandedCourse === course._id ? '1px solid #e2e8f0' : 'none',
                                    transition: 'background 0.2s'
                                }}
                                onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ background: '#eff6ff', color: 'var(--primary-color)', borderRadius: '10px', padding: '10px', display: 'flex' }}>
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{course.title}</span>
                                            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{course.code}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <StarRating rating={course.averageRating} />
                                            <span style={{ fontWeight: 700, color: '#d97706' }}>{course.averageRating.toFixed(1)}</span>
                                            <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>({course.numReviews} {course.numReviews === 1 ? 'review' : 'reviews'})</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ color: 'var(--text-gray)' }}>
                                    {expandedCourse === course._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Reviews List */}
                            {expandedCourse === course._id && (
                                <div style={{ padding: '10px 25px 25px' }}>
                                    {course.reviews.map((review, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: '16px',
                                                marginTop: '12px',
                                                background: '#f8fafc',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        background: 'var(--primary-color)', color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: '0.9rem'
                                                    }}>
                                                        {review.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.name}</div>
                                                        <StarRating rating={review.rating} size={13} />
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.75rem', color: 'var(--text-gray)',
                                                    background: review.rating >= 4 ? '#f0fdf4' : review.rating >= 3 ? '#fffbeb' : '#fef2f2',
                                                    color: review.rating >= 4 ? '#16a34a' : review.rating >= 3 ? '#d97706' : '#dc2626',
                                                    padding: '3px 10px', borderRadius: '20px', fontWeight: 600
                                                }}>
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                "{review.comment}"
                                            </p>
                                            {review.createdAt && (
                                                <p style={{ margin: '8px 0 0', color: 'var(--text-gray)', fontSize: '0.78rem' }}>
                                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Courses without reviews */}
            {coursesWithoutReviews.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <h2 className="section-title" style={{ marginBottom: '16px' }}>Awaiting Feedback</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {coursesWithoutReviews.map(course => (
                            <Card key={course._id} style={{ padding: '18px', border: '1px solid #e2e8f0', opacity: 0.8 }}>
                                <div style={{ fontWeight: 600, marginBottom: '6px' }}>{course.title}</div>
                                <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px' }}>{course.code}</span>
                                <p style={{ margin: '10px 0 0', color: 'var(--text-gray)', fontSize: '0.82rem' }}>No reviews yet</p>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseReviews;
