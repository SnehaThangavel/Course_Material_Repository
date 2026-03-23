import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import { Users, Search, BookOpen } from 'lucide-react';

const AdminStudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await axios.get('/api/analytics/students-list');
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const departments = ['All', ...new Set(students.map(s => s.department).filter(Boolean))];
    const years = ['All', ...new Set(students.map(s => s.year).filter(Boolean))];

    const filteredStudents = students.filter(student => {
        const matchesSearch = (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesDept = deptFilter === 'All' || student.department === deptFilter;
        const matchesYear = yearFilter === 'All' || student.year === yearFilter;

        return matchesSearch && matchesDept && matchesYear;
    });

    return (
        <AdminLayout>
            <div style={{ paddingBottom: '5rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={28} color="var(--primary)" />
                        Total Students
                    </h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>View a complete list of registered students.</p>
                </div>

                <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Search</label>
                        <div className="input-with-icon">
                            <div className="input-icon"><Search size={18} /></div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or roll number..."
                                className="input-field has-icon"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Department</label>
                        <select className="input-field" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Year</label>
                        <select className="input-field" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                            {years.map(y => <option key={y} value={y}>{y.startsWith('Year') ? y : `Year ${y}`}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? <div style={{ padding: '5rem 0' }}><Loader /></div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <Card 
                                    key={student._id} 
                                    onClick={() => setSelectedStudent(student)}
                                    style={{ padding: '1.25rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                                >
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                                        {(student.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{student.name}</h3>
                                            {student.rollNumber && <span className="badge badge-primary">{student.rollNumber}</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, flexWrap: 'wrap' }}>
                                            <span>{student.email}</span>
                                            <span>•</span>
                                            <span>{student.department || 'Department Not Set'}</span>
                                            {student.year && (
                                                <>
                                                    <span>•</span>
                                                    <span>Year {student.year}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', gap: '2rem' }}>
                                        <div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{student.enrolledCount || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>ENROLLED</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--success)' }}>{student.completedCount || 0}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>COMPLETED</div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="card" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Users size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1.1rem' }}>No students match your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }} onClick={() => setSelectedStudent(null)}>
                    <Card style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setSelectedStudent(null)} 
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                                {selectedStudent.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{selectedStudent.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{selectedStudent.rollNumber || 'No Roll Number'}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DEPARTMENT</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{selectedStudent.department || 'N/A'}</div>
                            </div>
                            <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>YEAR</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{selectedStudent.year || 'N/A'}</div>
                            </div>
                            <div style={{ background: 'var(--surface-muted)', padding: '1rem', borderRadius: '12px', gridColumn: 'span 2' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>EMAIL ADDRESS</div>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{selectedStudent.email}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--primary-light)', borderRadius: '15px', color: 'var(--primary)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 950 }}>{selectedStudent.enrolledCount || 0}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>REGISTERED COURSES</div>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 950 }}>{selectedStudent.completedCount || 0}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>COMPLETED COURSES</div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminStudentsList;
