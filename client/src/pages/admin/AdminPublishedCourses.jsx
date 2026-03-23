import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { BookOpen, Search, Layers, FileText } from 'lucide-react';

const AdminPublishedCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('All');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axios.get('/api/analytics/published-courses');
                setCourses(data);
            } catch (error) {
                console.error('Error fetching published courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const categories = ['All', 'Software', 'Hardware', 'General'];
    const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCat = catFilter === 'All' || course.skillCategory === catFilter || course.category === catFilter;
        const matchesLevel = levelFilter === 'All' || course.level === levelFilter;

        return matchesSearch && matchesCat && matchesLevel;
    });

    const sortLevels = (breakdown) => {
        if (!breakdown) return [];
        return Object.entries(breakdown).sort(([a], [b]) => {
            if (a === 'Full Course') return -1;
            if (b === 'Full Course') return 1;
            return a.localeCompare(b, undefined, { numeric: true });
        });
    };

    return (
        <AdminLayout>
            <div style={{ paddingBottom: '5rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={28} color="var(--primary)" />
                        Published Courses
                    </h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>View all active courses currently available to students.</p>
                </div>

                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Search</label>
                        <div className="input-with-icon">
                            <div className="input-icon"><Search size={18} /></div>
                            <input
                                type="text"
                                placeholder="Search by title or code..."
                                className="input-field has-icon"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                        <select className="input-field" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Level</label>
                        <select className="input-field" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? <div style={{ padding: '5rem 0' }}><Loader /></div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map(course => (
                                <Card 
                                    key={course._id} 
                                    onClick={() => setSelectedCourse(course)}
                                    style={{ padding: '1.25rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                                >
                                    <div style={{ width: '110px', height: '75px', background: 'var(--surface-muted)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {course.coverImage ? (
                                            <img src={course.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <BookOpen size={32} style={{ color: 'var(--text-light)' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <span className="badge badge-primary">{course.courseCode}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h3>
                                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Layers size={14} />
                                                <strong style={{ color: 'var(--primary)' }}>{course.levels?.length || course.totalLevels || 0}</strong>&nbsp;Levels
                                            </span>
                                            <span>•</span>
                                            <span>{course.level}</span>
                                            <span>•</span>
                                            <span>{course.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{course.enrollmentCount || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>STUDENTS</div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="card" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Search size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1.1rem' }}>No courses match your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Course Detail Modal */}
            {selectedCourse && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }} onClick={() => { setSelectedCourse(null); setExpandedLevel(null); }}>
                    <Card style={{ maxWidth: '800px', width: '100%', padding: '2.5rem', position: 'relative', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => { setSelectedCourse(null); setExpandedLevel(null); }} 
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-muted)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 10 }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '120px', height: '90px', background: 'var(--surface-muted)', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
                                {selectedCourse.coverImage ? (
                                    <img src={selectedCourse.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <BookOpen size={40} style={{ color: 'var(--text-light)', margin: 'auto' }} />
                                )}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <span className="badge badge-primary">{selectedCourse.courseCode}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{selectedCourse.category}</span>
                                </div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>{selectedCourse.title}</h2>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ padding: '1.5rem', background: 'var(--primary-light)', borderRadius: '20px', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 950, lineHeight: 1 }}>{selectedCourse.enrollmentCount || 0}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Enrollments</div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'var(--success-light)', borderRadius: '20px', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 950, lineHeight: 1 }}>{selectedCourse.completedCount || 0}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Completions</div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>Level-wise Student List</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {Object.entries(selectedCourse.levelBreakdown || {}).length > 0 ? (
                                    sortLevels(selectedCourse.levelBreakdown).map(([lvl, data]) => {
                                        const displayLvl = lvl === 'Full Course' ? 'Level 1' : lvl;
                                        return (
                                    <div key={lvl} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-muted)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                        <div 
                                            onClick={() => setExpandedLevel(expandedLevel === lvl ? null : lvl)}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                        >
                                            <span style={{ fontWeight: 750, color: 'var(--text-main)' }}>{displayLvl}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontWeight: 800, color: data.count > 0 ? 'var(--primary)' : 'var(--text-muted)', background: data.count > 0 ? 'var(--primary-light)' : 'var(--surface)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>{data.count} Students</span>
                                                <div style={{ transform: expandedLevel === lvl ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</div>
                                            </div>
                                        </div>
                                        
                                        {expandedLevel === lvl && (
                                            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {data.students && data.students.length > 0 ? data.students.map(student => (
                                                    <div 
                                                        key={student._id} 
                                                        onClick={() => setViewingStudent(student)}
                                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                        className="hover:background-var-surface-muted"
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                                                                {student.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 750, color: 'var(--text-main)', fontSize: '0.9rem' }}>{student.name}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.rollNumber}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>Profile →</div>
                                                    </div>
                                                )) : (
                                                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0' }}>No students enrolled in this level.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ); })
                            ) : (
                                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0' }}>No level breakdown available.</p>
                            )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Student Detail Modal Drill-down */}
            {viewingStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '2rem' }} onClick={() => setViewingStudent(null)}>
                    <Card style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setViewingStudent(null)} 
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-muted)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 900, color: '#fff' }}>
                                {viewingStudent.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.3rem' }}>{viewingStudent.name}</h2>
                            <span className="badge badge-primary">{viewingStudent.rollNumber || 'STU-ID-404'}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.4rem' }}>Department</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{viewingStudent.department || 'General'}</div>
                            </div>
                            <div style={{ background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.4rem' }}>Year</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Year {viewingStudent.year || '1'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.75rem', background: 'var(--primary-light)', borderRadius: '20px', color: 'var(--primary)' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 950 }}>{viewingStudent.enrolledCount || 0}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>REGISTERED</div>
                            </div>
                            <div style={{ width: '1px', background: 'var(--primary-border)', margin: '0 1rem' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 950 }}>{viewingStudent.completedCount || 0}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800 }}>COMPLETED</div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPublishedCourses;
