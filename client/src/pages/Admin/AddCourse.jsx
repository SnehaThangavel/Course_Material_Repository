import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const AddCourse = () => {
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/courses', { title, code, description });
            navigate('/admin/courses');
        } catch (error) {
            console.error(error);
            alert('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Add New Course</h1>
            </div>
            <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Course Title</label>
                        <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Introduction to React" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Course Code</label>
                        <input className="form-input" value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. REACT101" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows="4" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Course description..."></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button type="button" variant="outline" onClick={() => navigate('/admin/courses')}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddCourse;
