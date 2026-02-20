import React, { useState, useEffect } from 'react';
import { Award, Star, Zap, CheckCircle, Shield, ArrowRight, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import api from '../../services/api';
import '../../styles/pages.css';

const ViewProgress = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                // Fetch all courses and filter by registration status
                const { data: allCourses } = await api.get('/courses');

                // If we have user data, filter the courses
                if (user?.enrolledCourses) {
                    const filtered = allCourses.filter(c => user.enrolledCourses.includes(c._id));
                    setEnrolledCourses(filtered);
                } else {
                    // Fallback to fetching profile to get latest enrolled list
                    const { data: profile } = await api.get('/auth/me');
                    const filtered = allCourses.filter(c => profile.enrolledCourses?.includes(c._id));
                    setEnrolledCourses(filtered);
                }
            } catch (error) {
                console.error('Failed to fetch registered courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrolledCourses();
    }, [user?.enrolledCourses]);

    if (loading) return <div className="loading-container">Loading your curriculum...</div>;

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title">My Registered Courses</h1>
                    <p style={{ color: 'var(--text-gray)' }}>
                        Direct access to the courses you've joined.
                    </p>
                </div>
                <Link to="/student/courses">
                    <Button variant="outline">Browse More Courses</Button>
                </Link>
            </div>

            <div className="grid-3">
                {enrolledCourses.length > 0 ? (
                    enrolledCourses.map(course => (
                        <Card key={course._id} style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '25px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#eff6ff', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '4px' }}>
                                    {course.code}
                                </span>
                            </div>
                            <h3 style={{ margin: '0 0 10px 0' }}>{course.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '25px', flex: 1 }}>
                                {course.description}
                            </p>
                            <Button
                                variant="primary"
                                style={{ width: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px' }}
                                onClick={() => navigate(`/student/course/${course._id}#materials`)}
                            >
                                Continue Learning <ArrowRight size={18} />
                            </Button>
                        </Card>
                    ))
                ) : (
                    <Card style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                        <BookOpen size={48} style={{ color: '#94a3b8', marginBottom: '20px' }} />
                        <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>No courses registered yet</h2>
                        <p style={{ color: 'var(--text-gray)', marginBottom: '30px' }}>Explore our repository and start your learning journey today.</p>
                        <Link to="/student/courses">
                            <Button variant="primary">Explore Courses</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ViewProgress;
