import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import {
    ChevronLeft, Download, ExternalLink, FileText,
    CheckCircle, Star, MessageSquare, Layers, BookOpen,
    ChevronDown, ChevronUp, ClipboardList, Lock
} from 'lucide-react';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [allEnrollments, setAllEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [enrollingLevel, setEnrollingLevel] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState(null);

    const fetchCourseData = async () => {
        try {
            const { data } = await axios.get(`/api/courses/${id}`);
            setCourse(data);
            const enrollRes = await axios.get('/api/mycourses');
            setAllEnrollments(enrollRes.data || []);
        } catch (err) {
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    // Main enrollment (no level) — legacy
    const mainEnrollment = allEnrollments.find(
        e => e.courseId && (e.courseId._id === id || e.courseId === id) && (!e.levelNumber || e.levelNumber === 0)
    );

    // Per-level enrollment lookup
    const getLevelEnrollment = (levelNumber) =>
        allEnrollments.find(
            e => (e.courseId?._id === id || e.courseId === id) && e.levelNumber === levelNumber
        );

    // Enroll in the full course first (no level)
    const handleCourseEnroll = async () => {
        try {
            await axios.post('/api/enroll', { courseId: id });
            toast.success('Successfully enrolled in course! You can now register for individual levels.');
            fetchCourseData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Enrollment failed');
        }
    };

    // Register for a specific level
    const handleLevelEnroll = async (levelNumber) => {
        setEnrollingLevel(levelNumber);
        try {
            await axios.post('/api/enroll', { courseId: id, levelNumber });
            toast.success(`Registered for Level ${levelNumber}!`);
            fetchCourseData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to register for this level');
        } finally {
            setEnrollingLevel(null);
        }
    };

    const handleMarkComplete = async (levelNumber) => {
        try {
            await axios.put('/api/progress', { courseId: id, levelNumber, completed: true, progress: 100 });
            toast.success(`Level ${levelNumber} marked as complete!`);
            fetchCourseData();
        } catch (err) {
            toast.error('Failed to update progress');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await axios.post(`/api/courses/${id}/reviews`, { rating, comment });
            toast.success('Review submitted!');
            setComment('');
            fetchCourseData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const scrollTo = (elId) => {
        const el = document.getElementById(elId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) return <StudentLayout><div style={{ padding: '6rem 0' }}><Loader size={48} /></div></StudentLayout>;
    if (!course) return <StudentLayout><div style={{ padding: '6rem 0', textAlign: 'center' }}>Course not found</div></StudentLayout>;

    const levels = course.levels || [];
    const hasCourseEnrollment = !!mainEnrollment;

    return (
        <StudentLayout>
            <div style={{ display: 'flex', gap: '2.5rem', paddingBottom: '5rem', alignItems: 'flex-start' }}>

                {/* Sticky Sidebar */}
                <aside style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '2rem' }} className="desktop-only">
                    <div style={{ background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.7rem', marginBottom: '1.25rem', opacity: 0.6 }}>
                            Course Curriculum
                        </h3>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {levels.map((lvl, idx) => {
                                const lvlEnroll = getLevelEnrollment(lvl.levelNumber);
                                return (
                                    <button key={idx} onClick={() => scrollTo(`level-${idx}`)}
                                        style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.875rem', fontSize: '0.85rem', color: 'var(--text-muted)', borderRadius: '10px', transition: 'all 0.2s', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {lvlEnroll ? (
                                            <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                                        ) : (
                                            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, flexShrink: 0 }}>
                                                {lvl.levelNumber}
                                            </span>
                                        )}
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lvl.levelTitle}</span>
                                    </button>
                                );
                            })}
                            {/* Legacy sections fallback */}
                            {levels.length === 0 && (course.sections || []).map((sec, idx) => (
                                <button key={idx} onClick={() => scrollTo(`section-${idx}`)}
                                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.875rem', fontSize: '0.85rem', color: 'var(--text-muted)', borderRadius: '10px', transition: 'all 0.2s', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    {sec.title}
                                </button>
                            ))}
                            <button onClick={() => scrollTo('reviews-section')}
                                style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.875rem', fontSize: '0.85rem', color: 'var(--text-muted)', borderRadius: '10px', transition: 'all 0.2s', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                                <Star size={13} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                Student Feedback
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
                    <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                        <ChevronLeft size={18} style={{ marginRight: '0.4rem' }} /> Return to Library
                    </button>

                    {/* Hero Card */}
                    <Card style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 380px', padding: '2.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{course.category}</span>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', border: '1px solid var(--border)', padding: '0.2rem 0.7rem', borderRadius: '100px' }}>{course.level}</span>
                                    {course.skillCategory && (
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--primary-light)', padding: '0.2rem 0.7rem', borderRadius: '100px' }}>{course.skillCategory}</span>
                                    )}
                                </div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.1 }}>{course.title}</h1>
                                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>{course.description}</p>

                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Course Code</span>
                                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{course.courseCode}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Total Levels</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Layers size={14} /> {levels.length || course.totalLevels || 0} Levels
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Avg. Rating</span>
                                        <span style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Star size={13} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />
                                            {course.reviews?.length > 0
                                                ? (course.reviews.reduce((a, r) => a + r.rating, 0) / course.reviews.length).toFixed(1)
                                                : '0.0'}/5.0
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Cover + Enroll */}
                            <div style={{ width: '100%', maxWidth: '340px', flexShrink: 0, padding: '1.75rem', background: 'var(--bg)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
                                <div style={{ aspectRatio: '16/9', width: '100%', background: 'var(--surface-muted)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    {course.coverImage ? (
                                        <img src={course.coverImage} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                                            <BookOpen size={40} strokeWidth={1} />
                                        </div>
                                    )}
                                </div>

                                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center' }}>
                                    {hasCourseEnrollment ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#22c55e', fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                                                <CheckCircle size={16} /> ENROLLED
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                                Register for individual levels below ↓
                                            </p>
                                            <button
                                                className="btn-secondary"
                                                style={{ width: '100%', fontSize: '0.875rem' }}
                                                onClick={() => scrollTo('level-0')}>
                                                View Levels
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                                                Enroll in this course to register for individual levels
                                            </p>
                                            <button className="btn-primary" style={{ width: '100%' }} onClick={handleCourseEnroll}>
                                                Enroll in Course
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ━━━ LEVELS SECTION ━━━ */}
                    {levels.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <Layers size={22} style={{ color: 'var(--primary)' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Course Levels</h2>
                                <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.75rem' }}>{levels.length} Levels</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {levels.map((lvl, idx) => {
                                    const lvlEnroll = getLevelEnrollment(lvl.levelNumber);
                                    const isExpanded = expandedLevel === idx;
                                    const isRegistered = !!lvlEnroll;
                                    const isCompleted = lvlEnroll?.completed;

                                    return (
                                        <Card key={idx} id={`level-${idx}`}
                                            style={{
                                                padding: '0', overflow: 'hidden',
                                                border: isRegistered ? '1.5px solid var(--primary-light)' : '1px solid var(--border)',
                                                transition: 'all 0.2s'
                                            }}>
                                            {/* Level Header */}
                                            <div
                                                onClick={() => {
                                                    const isAptitude = course.title.toLowerCase().includes('aptitude');
                                                    if (!isRegistered && !isAptitude) {
                                                        toast.info('Please register for this level to view topics and materials.');
                                                        return;
                                                    }
                                                    setExpandedLevel(isExpanded ? null : idx);
                                                }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem', cursor: 'pointer', background: isRegistered ? 'linear-gradient(135deg, #f0f4ff, #fff)' : 'var(--surface)' }}>

                                                {/* Level number badge */}
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isRegistered ? 'var(--primary)' : 'var(--surface-muted)', color: isRegistered ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                                                    {isCompleted ? <CheckCircle size={20} /> : lvl.levelNumber}
                                                </div>

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{lvl.levelTitle}</h3>
                                                        {isCompleted ? (
                                                            <span className="badge" style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem' }}>✅ Completed</span>
                                                        ) : isRegistered && (lvlEnroll?.progress > 0) ? (
                                                            <span className="badge" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.7rem' }}>🔵 ON GOING ({lvlEnroll.progress}%)</span>
                                                        ) : isRegistered ? (
                                                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>Registered</span>
                                                        ) : null}
                                                    </div>
                                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0', fontWeight: 500 }}>
                                                        {(lvl.topics || []).length} topic{(lvl.topics || []).length !== 1 ? 's' : ''}
                                                        {lvl.topics?.length > 0 && ` — ${lvl.topics.map(t => t.title).slice(0, 3).join(', ')}${lvl.topics.length > 3 ? '...' : ''}`}
                                                    </p>
                                                </div>

                                                {/* Register / Status button */}
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    {isCompleted ? (
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', padding: '0.5rem 1rem', background: '#dcfce7', borderRadius: '8px' }}>
                                                            Done
                                                        </span>
                                                    ) : isRegistered ? (
                                                        <button
                                                            className="btn-secondary"
                                                            style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
                                                            onClick={() => handleMarkComplete(lvl.levelNumber)}>
                                                            Mark Complete
                                                        </button>
                                                    ) : hasCourseEnrollment ? (() => {
                                                        // Check for Level N-1 completion if lvl.levelNumber > 1
                                                        const isFirstLevel = lvl.levelNumber === 1;
                                                        const prevLvlEnroll = !isFirstLevel ? getLevelEnrollment(lvl.levelNumber - 1) : null;
                                                        const isAptitude = course.title.toLowerCase().includes('aptitude');
                                                        const isPrerequisiteMet = isFirstLevel || isAptitude || !!prevLvlEnroll?.completed;

                                                        if (!isPrerequisiteMet) {
                                                            return (
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                                                    <button
                                                                        className="btn-secondary"
                                                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem', opacity: 0.6, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                                        disabled>
                                                                        <Lock size={13} /> Locked
                                                                    </button>
                                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                                                                        Complete Level {lvl.levelNumber - 1} first
                                                                    </span>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <button
                                                                className="btn-primary"
                                                                style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                                disabled={enrollingLevel === lvl.levelNumber}
                                                                onClick={() => handleLevelEnroll(lvl.levelNumber)}>
                                                                <ClipboardList size={14} />
                                                                {enrollingLevel === lvl.levelNumber ? 'Registering...' : 'Register for Level'}
                                                            </button>
                                                        );
                                                    })() : (
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <Lock size={13} /> Enroll first
                                                        </span>
                                                    )}
                                                </div>

                                                {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                                            </div>

                                            {/* Expanded Content: Topics + Materials */}
                                            {isExpanded && (
                                                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                                                    {(lvl.topics || []).length === 0 ? (
                                                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No topics defined for this level yet.</p>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                            {lvl.topics.map((topic, tIdx) => (
                                                                <div key={tIdx}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
                                                                            {tIdx + 1}
                                                                        </div>
                                                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{topic.title}</h4>
                                                                    </div>

                                                                    {/* Materials */}
                                                                    {topic.materials && topic.materials.length > 0 && (
                                                                        <div style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                            {topic.materials.map((mat, mIdx) => (
                                                                                <a key={mIdx} href={mat.url || '#'} target="_blank" rel="noopener noreferrer"
                                                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.2s' }}>
                                                                                    <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                                                        {mat.type === 'pdf' || mat.type === 'document' ? <FileText size={14} /> : <ExternalLink size={14} />}
                                                                                    </div>
                                                                                    <div style={{ flex: 1 }}>
                                                                                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem' }}>{mat.title}</span>
                                                                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--bg)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{mat.type}</span>
                                                                                    </div>
                                                                                    <Download size={14} style={{ color: 'var(--text-light)' }} />
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ━━━ LEGACY SECTIONS FALLBACK ━━━ */}
                    {levels.length === 0 && (course.sections || []).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {course.sections.map((sec, idx) => (
                                <section key={idx} id={`section-${idx}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                            {idx + 1}
                                        </div>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{sec.title}</h2>
                                    </div>
                                    {sec.materials?.length > 0 ? (
                                        <div className="grid-2">
                                            {sec.materials.map((mat, mIdx) => (
                                                <a href={mat.url} target="_blank" rel="noopener noreferrer" key={mIdx}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', textDecoration: 'none' }}>
                                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                                        {mat.type === 'pdf' || mat.type === 'document' ? <FileText size={18} /> : <ExternalLink size={18} />}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{mat.title}</p>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{mat.type}</span>
                                                    </div>
                                                    <Download size={16} style={{ color: 'var(--text-light)' }} />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                                            No materials yet for this section.
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    )}

                    {/* ━━━ REVIEWS SECTION ━━━ */}
                    <section id="reviews-section" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Star size={24} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} /> Student Reviews
                            </h2>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.4rem 0.875rem', borderRadius: '10px' }}>
                                {course.reviews?.length || 0} Reviews
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {course.reviews && course.reviews.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                                    {course.reviews.map((rev, idx) => (
                                        <Card key={idx} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.2rem' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} style={{ fill: i < rev.rating ? 'var(--warning)' : 'none', color: i < rev.rating ? 'var(--warning)' : '#e2e8f0' }} />
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>"{rev.comment}"</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                                                    {rev.user?.name?.charAt(0) || 'S'}
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{rev.user?.name || 'Student'}</span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                                    <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                    <p>No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}

                            <Card style={{ padding: '2.5rem', border: '1px solid var(--primary-light)' }}>
                                <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.75rem' }}>Share Your Review</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 500 }}>Your feedback helps other students make better learning decisions.</p>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <Star key={num} size={40} onClick={() => setRating(num)}
                                                    style={{ cursor: 'pointer', fill: num <= rating ? 'var(--warning)' : 'none', color: num <= rating ? 'var(--warning)' : '#e2e8f0', transition: 'all 0.2s' }} />
                                            ))}
                                        </div>
                                        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                                            placeholder="Write your review..."
                                            required
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', resize: 'none', minHeight: '120px', fontSize: '0.95rem', outline: 'none', marginBottom: '1.25rem' }} />
                                        <button type="submit" className="btn-primary" style={{ padding: '0.875rem 2.5rem' }} disabled={submittingReview}>
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            </Card>
                        </div>
                    </section>
                </div>
            </div>
            <style>{`@media (max-width: 1024px) { .desktop-only { display: none; } }`}</style>
        </StudentLayout>
    );
};

export default CourseDetails;
