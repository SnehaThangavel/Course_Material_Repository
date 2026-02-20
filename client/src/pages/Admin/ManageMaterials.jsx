import React, { useEffect, useState } from 'react';
import Card from '../../components/UI/Card';
import api from '../../services/api';
import '../../styles/pages.css';

const ManageMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await api.get('/courses/materials/all');
                setMaterials(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching materials');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    const handleDelete = async (courseId, materialId) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;

        try {
            // We'd need a delete material endpoint
            // For now, let's just mock the UI update if we don't have it
            // api.delete(`/courses/${courseId}/materials/${materialId}`);
            alert('Delete functionality for materials would call DELETE /api/courses/:id/materials/:materialId');
            setMaterials(materials.filter(m => m._id !== materialId));
        } catch (err) {
            alert('Error deleting material');
        }
    };

    if (loading) {
        return (
            <div className="content-wrapper">
                <div className="page-header">
                    <h1 className="page-title">All Materials</h1>
                </div>
                <div className="loading-skeleton" style={{ height: '400px', backgroundColor: '#eee', borderRadius: '10px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            <div className="page-header">
                <h1 className="page-title">All Materials</h1>
                <div style={{ color: 'var(--text-gray)' }}>Total Materials Resources: {materials.length}</div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Material Title</th>
                            <th>Course</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                    No materials found.
                                </td>
                            </tr>
                        ) : (
                            materials.map(material => (
                                <tr key={material._id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{material.title}</div>
                                    </td>
                                    <td>{material.courseName}</td>
                                    <td>
                                        <span className={`badge badge-${material.type}`}>
                                            {material.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <a
                                                href={material.link.startsWith('http') ? material.link : `//${material.link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline"
                                                style={{ padding: '5px 10px', fontSize: '0.8rem', textDecoration: 'none' }}
                                            >
                                                Open
                                            </a>
                                            <button
                                                onClick={() => handleDelete(material.courseId, material._id)}
                                                className="btn btn-outline"
                                                style={{ padding: '5px 10px', fontSize: '0.8rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default ManageMaterials;
