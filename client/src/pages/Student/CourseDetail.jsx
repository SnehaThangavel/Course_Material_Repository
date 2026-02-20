import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, Send, MessageSquare } from 'lucide-react';
import Toast from '../../components/UI/Toast';
import '../../styles/pages.css';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, refreshUser } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [toast, setToast] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [completedIds, setCompletedIds] = useState([]);

    useEffect(() => {
        if (!loading && location.hash === '#materials') {
            const element = document.getElementById('materials');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [loading, location.hash]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const [courseRes, profileRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get('/auth/me')
                ]);
                setCourse(courseRes.data);
                setEnrolledIds((profileRes.data.enrolledCourses || []).map(i => i.toString()));
                setCompletedIds((profileRes.data.completedCourses || []).map(i => i.toString()));
                // Check if user already reviewed
                const myReview = courseRes.data.reviews.find(r => r.user === user?._id);
                if (myReview) {
                    setRating(myReview.rating);
                    setComment(myReview.comment);
                }
            } catch (error) {
                console.error(error);
                navigate('/student/courses');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, navigate, user?._id]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await api.post(`/courses/${id}/enroll`);
            await refreshUser();
            setEnrolledIds(prev => [...prev, id]);
            setToast({ type: 'success', text: 'Successfully registered for this course!' });
        } catch (error) {
            console.error(error);
            setToast({ type: 'error', text: 'Failed to register' });
        } finally {
            setEnrolling(false);
        }
    };

    const handleMarkComplete = async () => {
        setMarking(true);
        try {
            await api.post(`/courses/${id}/complete`);
            await refreshUser();
            setCompletedIds(prev => [...prev, id]);
            setToast({ type: 'success', text: 'Course marked as completed!' });
        } catch (error) {
            console.error(error);
            setToast({ type: 'error', text: 'Failed to mark as completed' });
        } finally {
            setMarking(false);
        }
    };

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setToast({ type: 'error', text: 'Please select a rating' });
        if (!comment.trim()) return setToast({ type: 'error', text: 'Please add a comment' });

        setSubmittingRating(true);
        try {
            await api.post(`/courses/${id}/reviews`, { rating, comment });
            setToast({ type: 'success', text: 'Review submitted! Thank you.' });
            // Refresh course data
            const { data } = await api.get(`/courses/${id}`);
            setCourse(data);
        } catch (error) {
            setToast({ type: 'error', text: error.response?.data?.message || 'Failed to submit review' });
        } finally {
            setSubmittingRating(false);
        }
    };

    const isEnrolled = enrolledIds.includes(id);
    const isCompleted = completedIds.includes(id);
    const hasReviewed = course?.reviews?.some(r => r.user === user?._id);

    if (loading) return <div className="content-wrapper">Loading course details...</div>;

    const renderActionButtons = () => {
        if (isCompleted) {
            return (
                <Button variant="outline" disabled style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>
                    <i className="fa-solid fa-check"></i> Completed
                </Button>
            );
        }

        if (!isEnrolled) {
            return (
                <Button onClick={handleEnroll} disabled={enrolling} variant="primary">
                    <i className="fa-solid fa-plus-circle" style={{ marginRight: '8px' }}></i>
                    {enrolling ? 'Registering...' : 'Register for this Course'}
                </Button>
            );
        }

        return (
            <Button onClick={handleMarkComplete} disabled={marking} variant="primary">
                {marking ? 'Updating...' : 'Mark as Completed'}
            </Button>
        );
    };

    return (
        <div className="content-wrapper">
            {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
            <div className="page-header">
                <div>
                    <Button variant="outline" onClick={() => navigate('/student/courses')} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        &larr; Back to Courses
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h1 className="page-title" style={{ margin: 0 }}>{course.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fffbeb', padding: '5px 12px', borderRadius: '20px', border: '1px solid #fde68a' }}>
                            <Star size={18} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontWeight: 700, color: '#d97706' }}>{course.averageRating.toFixed(1)}</span>
                            <span style={{ color: '#92400e', fontSize: '0.8rem' }}>({course.numReviews})</span>
                        </div>
                    </div>
                </div>
                {renderActionButtons()}
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <Card>
                        <h2 className="section-title">Description</h2>
                        <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>{course.description}</p>
                    </Card>

                    <div id="materials">
                        <h2 className="section-title">Course Materials</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {course.materials.length === 0 && <p style={{ color: 'var(--text-gray)' }}>No materials available yet.</p>}
                            {course.materials.map((mat, index) => (
                                <Card key={index} style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '20px' }} className="clickable">
                                    <div style={{
                                        width: '45px', height: '45px', borderRadius: '10px',
                                        background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--primary-color)'
                                    }}>
                                        <i className={`fa-solid ${mat.type === 'video' ? 'fa-video' : mat.type === 'image' ? 'fa-image' : 'fa-file-pdf'}`}></i>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{mat.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{mat.type.toUpperCase()}</div>
                                    </div>
                                    <a href={mat.link} target="_blank" rel="noreferrer">
                                        <Button variant="outline" style={{ padding: '8px 15px' }}>
                                            View
                                        </Button>
                                    </a>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <Card style={{ position: 'sticky', top: '20px' }}>
                        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Star size={20} color="#f59e0b" fill="#f59e0b" /> Course Rating
                        </h2>

                        {hasReviewed ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '15px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={24} fill={star <= rating ? "#f59e0b" : "none"} color="#f59e0b" />
                                    ))}
                                </div>
                                <p style={{ fontWeight: 600, margin: '0 0 5px' }}>You've rated this course</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontStyle: 'italic' }}>"{comment}"</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRatingSubmit}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <div
                                            key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                        >
                                            <Star
                                                size={32}
                                                fill={(hoverRating || rating) >= star ? "#f59e0b" : "none"}
                                                color="#f59e0b"
                                                style={{ transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Share your experience</label>
                                    <textarea
                                        className="form-input"
                                        placeholder="What did you think of this course?"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows="4"
                                        style={{ height: 'auto', resize: 'none' }}
                                        required
                                    ></textarea>
                                </div>
                                <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} disabled={submittingRating}>
                                    <Send size={18} /> {submittingRating ? 'Posting...' : 'Submit Rating'}
                                </Button>
                            </form>
                        )}

                        {course.reviews && course.reviews.length > 0 && (
                            <div style={{ marginTop: '30px' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MessageSquare size={16} /> Recent Feedback
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {course.reviews.slice(-3).reverse().map((rev, i) => (
                                        <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontWeight: 700 }}>{rev.name}</span>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={10} fill={s <= rev.rating ? "#f59e0b" : "none"} color="#f59e0b" />
                                                    ))}
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--text-gray)' }}>{rev.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
