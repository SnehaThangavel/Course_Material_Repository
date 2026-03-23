import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { CheckCircle, Search } from 'lucide-react';

const AdminCompletedDetails = () => {
    const [completions, setCompletions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState(null);

    useEffect(() => {
        const fetchCompletions = async () => {
            try {
                const { data } = await axios.get('/api/analytics/completed-details');
                setCompletions(data);
            } catch (error) {
                console.error('Error fetching completion details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompletions();
    }, []);

    const filtered = completions.filter(c => 
        (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );


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
                        <CheckCircle size={28} color="var(--success)" />
                        Completed Courses
                    </h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Breakdown of how many times each course has been fully completed.</p>
                </div>

                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem' }}>
                    <div className="input-with-icon" style={{ maxWidth: '400px' }}>
                        <div className="input-icon"><Search size={18} /></div>
                        <input
                            type="text"
                            placeholder="Search by course title or category..."
                            className="input-field has-icon"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? <div style={{ padding: '5rem 0' }}><Loader /></div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filtered.length > 0 ? (
                            filtered.map((item, index) => (
                                <Card 
                                    key={item._id} 
                                    onClick={() => setSelectedCourse(item)}
                                    style={{ padding: '1.25rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }}>
                                        #{index + 1}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
                                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                                            <span>{item.category}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>{item.completedCount}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.1rem' }}>Times Completed</div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="card" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Search size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1.1rem' }}>No completion data matches your search.</p>
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
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-muted)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s', zIndex: 10 }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.5rem', borderRadius: '12px' }}>
                                    <CheckCircle size={24} />
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{selectedCourse.category}</span>
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>{selectedCourse.title}</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'linear-gradient(135deg, var(--success), #10b981)', borderRadius: '20px', color: '#fff', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)' }}>
                                <div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 950, lineHeight: 1 }}>{selectedCourse.completedCount}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Completions</div>
                                </div>
                                <CheckCircle size={48} style={{ opacity: 0.2 }} />
                            </div>

                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Completion Breakdown
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {sortLevels(selectedCourse.levelBreakdown).filter(([lvl]) => lvl !== 'Full Course').map(([lvl, data]) => (
                                        <div key={lvl} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-muted)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                            <div 
                                                onClick={() => setExpandedLevel(expandedLevel === lvl ? null : lvl)}
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                                className="hover:background-var-border"
                                            >
                                                <span style={{ fontWeight: 750, color: 'var(--text-main)' }}>{lvl}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ fontWeight: 800, color: 'var(--success)', background: 'var(--success-light)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>{data.count} Students</span>
                                                    <div style={{ transform: expandedLevel === lvl ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</div>
                                                </div>
                                            </div>
                                            
                                            {expandedLevel === lvl && (
                                                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                                                    {data.students && data.students.length > 0 ? data.students.map(student => (
                                                        <div 
                                                            key={student._id} 
                                                            onClick={() => setViewingStudent(student)}
                                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            className="hover:background-var-surface-muted"
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 750, color: 'var(--text-main)', fontSize: '0.9rem' }}>{student.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.rollNumber}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>View Profile →</div>
                                                        </div>
                                                    )) : (
                                                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0' }}>No student details found.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Student Detail Modal Drill-down */}
            {viewingStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '2rem' }} onClick={() => setViewingStudent(null)}>
                    <Card style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setViewingStudent(null)} 
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-muted)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, var(--success), #10b981)', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.25rem', fontWeight: 900, color: '#fff', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)' }}>
                                {viewingStudent.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.3rem' }}>{viewingStudent.name}</h2>
                            <span className="badge badge-success" style={{ padding: '0.4rem 1rem' }}>{viewingStudent.rollNumber || 'STU-ID-404'}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Department</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{viewingStudent.department || 'General'}</div>
                            </div>
                            <div style={{ background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Academic Year</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>Year {viewingStudent.year || '1'}</div>
                            </div>
                            <div style={{ background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Official Email</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>{viewingStudent.email}</div>
                            </div>
                        </div>

                    </Card>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminCompletedDetails;
