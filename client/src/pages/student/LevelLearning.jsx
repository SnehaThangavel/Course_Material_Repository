import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import {
    ChevronLeft, Download, ExternalLink, FileText,
    CheckCircle, Layers, BookOpen, ClipboardList
} from 'lucide-react';

const LevelLearning = () => {
    const { id, levelNumber } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [togglingMat, setTogglingMat] = useState(null); // "topicIdx-matIdx"

    const lvlNum = parseInt(levelNumber, 10);

    const fetchData = useCallback(async () => {
        try {
            const [courseRes, enrollRes] = await Promise.all([
                axios.get(`/api/courses/${id}`),
                axios.get('/api/mycourses'),
            ]);
            setCourse(courseRes.data);
            const allEnrollments = enrollRes.data || [];
            const lvlEnroll = allEnrollments.find(
                e => (e.courseId?._id === id || e.courseId === id) && e.levelNumber === lvlNum
            );
            setEnrollment(lvlEnroll || null);
        } catch {
            toast.error('Failed to load learning content');
        } finally {
            setLoading(false);
        }
    }, [id, lvlNum]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const isMaterialDone = (topicIndex, materialIndex) => {
        if (!enrollment?.completedMaterials) return false;
        return enrollment.completedMaterials.some(
            m => m.topicIndex === topicIndex && m.materialIndex === materialIndex
        );
    };

    const handleToggleMaterial = async (topicIndex, materialIndex) => {
        const key = `${topicIndex}-${materialIndex}`;
        if (togglingMat === key) return;
        setTogglingMat(key);
        try {
            const { data } = await axios.post('/api/progress/material', {
                courseId: id,
                levelNumber: lvlNum,
                topicIndex,
                materialIndex,
            });
            // Update enrollment in state directly for instant feedback
            setEnrollment(data);
        } catch {
            toast.error('Failed to update material status');
        } finally {
            setTogglingMat(null);
        }
    };

    const handleMarkComplete = async () => {
        setCompleting(true);
        try {
            const { data } = await axios.put('/api/progress', {
                courseId: id, levelNumber: lvlNum, completed: true, progress: 100
            });
            setEnrollment(data);
            toast.success(`Level ${lvlNum} marked as complete! 🎉`);
        } catch {
            toast.error('Failed to update progress');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) return <StudentLayout><div style={{ padding: '6rem 0' }}><Loader size={48} /></div></StudentLayout>;
    if (!course) return <StudentLayout><div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Course not found.</div></StudentLayout>;

    const levels = course.levels || [];
    const level = levels.find(l => l.levelNumber === lvlNum);

    if (!enrollment) return (
        <StudentLayout>
            <div style={{ padding: '6rem 0', textAlign: 'center' }}>
                <Layers size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem', opacity: 0.4 }} />
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    You are not registered for Level {lvlNum} of this course.
                </p>
                <button className="btn-primary" onClick={() => navigate(`/student/course/${id}`)}>Go to Course Page</button>
            </div>
        </StudentLayout>
    );

    if (!level) return <StudentLayout><div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Level not found.</div></StudentLayout>;

    const topics = level.topics || [];
    const isCompleted = enrollment?.completed;
    const progress = enrollment?.progress || 0;

    // Count total materials to show in header
    const totalMats = topics.reduce((sum, t) => sum + (t.materials?.length || 0), 0);
    const doneMats = enrollment?.completedMaterials?.length || 0;

    return (
        <StudentLayout>
            <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '5rem' }}>

                {/* Back nav */}
                <button onClick={() => navigate('/student/courses')}
                    style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem' }}>
                    <ChevronLeft size={18} style={{ marginRight: '0.4rem' }} /> Back to My Courses
                </button>

                {/* Header Card */}
                <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            {/* Breadcrumb */}
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <BookOpen size={13} />
                                <span
                                    onClick={() => navigate(`/student/course/${id}`)}
                                    style={{ cursor: 'pointer', color: 'var(--text-light)', transition: 'color 0.2s' }}
                                    onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                                    onMouseOut={(e) => e.target.style.color = 'var(--text-light)'}
                                    title="View Course Curriculum"
                                >
                                    {course.title}
                                </span>
                                <span style={{ opacity: 0.5 }}>›</span>
                                <span style={{ color: 'var(--primary)' }}>Level {lvlNum}</span>
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                                {level.levelTitle}
                            </h1>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {course.skillCategory && <span className="badge badge-primary">{course.skillCategory}</span>}
                                <span className="badge" style={{ background: 'var(--primary)', color: '#fff' }}>Level {lvlNum}</span>
                                {isCompleted
                                    ? <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>✅ Completed</span>
                                    : progress > 0
                                        ? <span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>🔵 ON GOING</span>
                                        : <span className="badge" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>Not Started</span>
                                }
                            </div>
                            {level.description && (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{level.description}</p>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                            {isCompleted ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 800, fontSize: '0.9rem', background: '#dcfce7', padding: '0.6rem 1.25rem', borderRadius: '10px' }}>
                                    <CheckCircle size={18} /> Completed
                                </div>
                            ) : (
                                <button className="btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                                    onClick={handleMarkComplete} disabled={completing}>
                                    <ClipboardList size={16} />
                                    {completing ? 'Saving...' : 'Mark as Complete'}
                                </button>
                            )}
                            {enrollment?.completionDate && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Completed on {new Date(enrollment.completionDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                            <span>Progress — {doneMats} of {totalMats} materials completed</span>
                            <span style={{ fontWeight: 800, color: isCompleted ? '#16a34a' : 'var(--primary)' }}>{progress}%</span>
                        </div>
                        <div style={{ background: 'var(--surface-muted)', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${progress}%`, height: '100%', borderRadius: '10px',
                                background: isCompleted ? '#22c55e' : 'var(--primary)',
                                transition: 'width 0.4s ease',
                            }} />
                        </div>
                    </div>
                </Card>

                {/* Topics & Materials */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <Layers size={20} style={{ color: 'var(--primary)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Study Material</h2>
                    <span className="badge" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.72rem' }}>
                        {topics.length} topic{topics.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {topics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                        <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>No study materials have been added to this level yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {topics.map((topic, tIdx) => (
                            <Card key={tIdx} style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: topic.materials?.length > 0 ? '1.25rem' : 0 }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
                                        {tIdx + 1}
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{topic.title}</h3>
                                </div>

                                {topic.materials && topic.materials.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {topic.materials.map((mat, mIdx) => {
                                            const done = isMaterialDone(tIdx, mIdx);
                                            const key = `${tIdx}-${mIdx}`;
                                            const isToggling = togglingMat === key;
                                            return (
                                                <div key={mIdx} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                                                    padding: '0.75rem 1rem',
                                                    background: done ? '#f0fdf4' : 'var(--bg)',
                                                    border: `1px solid ${done ? '#86efac' : 'var(--border)'}`,
                                                    borderRadius: '12px',
                                                    transition: 'all 0.2s',
                                                }}>
                                                    {/* Material icon */}
                                                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: done ? '#dcfce7' : 'var(--primary-light)', color: done ? '#16a34a' : 'var(--primary)', flexShrink: 0 }}>
                                                        {mat.type === 'pdf' || mat.type === 'document' ? <FileText size={15} /> : <ExternalLink size={15} />}
                                                    </div>

                                                    {/* Link to material */}
                                                    <a href={mat.url || '#'} target="_blank" rel="noopener noreferrer"
                                                        style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: 700, color: done ? '#16a34a' : 'var(--text-main)', fontSize: '0.875rem', textDecoration: 'none' }}>
                                                            {mat.title}
                                                        </span>
                                                        <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: done ? '#16a34a' : 'var(--primary)', background: done ? '#dcfce7' : 'var(--primary-light)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                            {mat.type}
                                                        </span>
                                                    </a>

                                                    {/* Download icon */}
                                                    <a href={mat.url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-light)', flexShrink: 0 }}>
                                                        <Download size={14} />
                                                    </a>

                                                    {/* ✅ Checkbox / Mark as Read button */}
                                                    <button
                                                        onClick={() => handleToggleMaterial(tIdx, mIdx)}
                                                        disabled={isToggling}
                                                        title={done ? 'Mark as unread' : 'Mark as read'}
                                                        style={{
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '6px',
                                                            border: `1px solid ${done ? '#22c55e' : 'var(--border)'}`,
                                                            background: done ? '#22c55e' : 'transparent',
                                                            color: done ? '#fff' : 'var(--text-main)',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                            cursor: isToggling ? 'wait' : 'pointer',
                                                            flexShrink: 0, transition: 'all 0.2s',
                                                            outline: 'none',
                                                        }}>
                                                        {done ? (
                                                            <><CheckCircle size={14} /> Read</>
                                                        ) : (
                                                            'Mark as Read'
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No materials for this topic yet.</p>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* Bottom Mark Complete / Next Steps */}
                {!isCompleted && topics.length > 0 && (
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button className="btn-primary"
                            style={{ padding: '0.875rem 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                            onClick={handleMarkComplete} disabled={completing}>
                            <CheckCircle size={18} />
                            {completing ? 'Saving...' : 'Mark Level as Complete'}
                        </button>
                    </div>
                )}

                {isCompleted && (
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button className="btn-secondary"
                            style={{ padding: '0.875rem 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                            onClick={() => navigate(`/student/course/${id}`)}>
                            <Layers size={18} />
                            View Course Curriculum
                        </button>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default LevelLearning;
