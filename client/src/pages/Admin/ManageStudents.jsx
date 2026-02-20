import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Eye } from 'lucide-react';
import Card from '../../components/UI/Card';
import api from '../../services/api';
import '../../styles/pages.css';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get('/auth/users?role=student');
                setStudents(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) return <div className="content-wrapper">Loading students...</div>;

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: '30px' }}>
                <h1 className="page-title">Community Students</h1>
                <p style={{ color: 'var(--text-gray)' }}>Manage and monitor student engagement across the platform.</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <Card style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Email</th>
                            <th>Enrolled Since</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                                            <User size={18} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{student.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)' }}>
                                        <Mail size={14} /> {student.email}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gray)' }}>
                                        <Calendar size={14} /> {new Date(student.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <Link to={`/admin/student/${student._id}`} className="no-underline">
                                        <button className="hero-search-btn" style={{ padding: '6px 15px', fontSize: '0.8rem', borderRadius: '8px' }}>
                                            <Eye size={14} /> Profile
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ManageStudents;
