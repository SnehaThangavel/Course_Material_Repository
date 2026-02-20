import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Book, CheckCircle, Activity, ChevronLeft } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import api from '../../services/api';
import '../../styles/pages.css';

const AdminStudentDetail = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Fetch all users to find the specific student and courses to map data
                const [{ data: users }, { data: allCourses }] = await Promise.all([
                    api.get('/auth/users'),
                    api.get('/courses')
                ]);

                const found = users.find(u => u._id === id);
                setStudent(found);
                setCourses(allCourses);
            } catch (error) {
                console.error('Error fetching student details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [id]);

    const getEnrolledCourses = () => {
        if (!student || !student.enrolledCourses) return [];
        return courses.filter(c => student.enrolledCourses.includes(c._id));
    };

    const getCompletedCourses = () => {
        if (!student || !student.completedCourses) return [];
        return courses.filter(c => student.completedCourses.includes(c._id));
    };

    if (loading) return <div className="content-wrapper">Loading student report...</div>;
    if (!student) return <div className="content-wrapper">Student not found.</div>;

    return (
        <div className="content-wrapper">
            <Link to="/admin/students" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)', marginBottom: '20px', textDecoration: 'none' }}>
                <ChevronLeft size={16} /> Back to Students
            </Link>

            <div className="grid-3" style={{ marginBottom: '30px' }}>
                <Card style={{ gridColumn: 'span 2', display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ margin: 0 }}>{student.name}</h1>
                        <p style={{ color: 'var(--text-gray)', margin: '5px 0 15px' }}>{student.email} • Joined {new Date(student.createdAt).toLocaleDateString()}</p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{student.enrolledCourses?.length || 0}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase' }}>Enrolled</div>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{student.completedCourses?.length || 0}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase' }}>Completed</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 style={{ marginTop: 0 }}>Institute Info</h3>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Organization:</strong> {student.organization || 'Not provided'}</p>
                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Bio:</strong> {student.bio || 'No bio available'}</p>
                </Card>
            </div>

            <div className="grid-2" style={{ marginTop: '30px' }}>
                <div>
                    <h2 className="section-title">Registered Courses</h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {getEnrolledCourses().length > 0 ? (
                            getEnrolledCourses().map(course => (
                                <Card key={course._id} style={{ padding: '15px', borderLeft: '4px solid var(--secondary-color)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--secondary-color)', marginBottom: '5px' }}>{course.code}</div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{course.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-gray)' }}>{course.level} • {course.category}</p>
                                </Card>
                            ))
                        ) : (
                            <Card style={{ padding: '20px', textAlign: 'center', color: 'var(--text-gray)' }}>
                                No registered courses.
                            </Card>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="section-title">Completed Courses</h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {getCompletedCourses().length > 0 ? (
                            getCompletedCourses().map(course => (
                                <Card key={course._id} style={{ padding: '15px', borderLeft: '4px solid var(--success)' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', marginBottom: '5px' }}>{course.code}</div>
                                    <h4 style={{ margin: '0 0 5px 0' }}>{course.title}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--success)' }}>
                                        <CheckCircle size={14} /> Completed
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Card style={{ padding: '20px', textAlign: 'center', color: 'var(--text-gray)' }}>
                                No completed courses.
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStudentDetail;
