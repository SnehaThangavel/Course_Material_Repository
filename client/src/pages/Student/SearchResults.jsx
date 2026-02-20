import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Filter, BookOpen, FileText, ChevronLeft, ChevronRight, Layout, Globe } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import '../../styles/pages.css';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';
    const initialCategory = queryParams.get('category') || '';
    const initialLevel = queryParams.get('level') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        fetchResults();
    }, [initialQuery, initialCategory, initialLevel, page]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            let url = `/courses/search?q=${initialQuery}&page=${page}&limit=9`;
            if (initialCategory) url += `&category=${initialCategory}`;
            if (initialLevel) url += `&level=${initialLevel}`;

            const { data } = await api.get(url);
            setResults(data.courses);
            setTotalPages(data.pages);
            setTotalResults(data.total);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (type, value) => {
        const params = new URLSearchParams(location.search);
        if (value) {
            params.set(type, value);
        } else {
            params.delete(type);
        }
        params.set('page', '1');
        navigate(`/student/search?${params.toString()}`);
    };

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="page-title">Discovery Hub</h1>
                    <p style={{ color: 'var(--text-gray)' }}>
                        {loading ? 'Searching repository...' : `Found ${totalResults} courses matching your criteria`}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }}>
                <aside>
                    <Card style={{ position: 'sticky', top: '90px', padding: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 700 }}>
                            <Filter size={18} /> Filters
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-gray)' }}>LEVEL</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                                    <label key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="level"
                                            checked={initialLevel === lvl}
                                            onChange={() => handleFilterChange('level', lvl)}
                                        /> {lvl}
                                    </label>
                                ))}
                                <button
                                    onClick={() => handleFilterChange('level', '')}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer', marginTop: '5px' }}
                                >
                                    Clear Level
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-gray)' }}>CATEGORY</label>
                            <select
                                className="form-input"
                                value={initialCategory}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                            >
                                <option value="">All Categories</option>
                                <option value="Programming">Programming</option>
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
                                <option value="Mathematics">Mathematics</option>
                            </select>
                        </div>
                    </Card>
                </aside>

                <main>
                    {loading ? (
                        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i} className="loading-skeleton" style={{ height: '280px' }}></Card>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                                {results.map(course => (
                                    <Link key={course._id} to={`/student/course/${course._id}`} className="no-underline">
                                        <Card className="clickable course-card" style={{ height: '100%', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{
                                                height: '160px',
                                                background: course.coverImage ? `url(${course.coverImage}) center/cover` : '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#cbd5e1'
                                            }}>
                                                {!course.coverImage && <Globe size={48} opacity={0.3} />}
                                            </div>
                                            <div style={{ padding: '20px', flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>{course.category}</span>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '4px' }}>{course.level}</span>
                                                </div>
                                                <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', color: '#1e293b' }}>{course.title}</h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {course.description}
                                                </p>
                                            </div>
                                            <div style={{ padding: '15px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                                                    <FileText size={14} />
                                                    <span>{course.materials.length} Materials</span>
                                                </div>
                                                <Button variant="primary" style={{ padding: '6px 15px', fontSize: '0.8rem', borderRadius: '8px' }}>Explore</Button>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '50px' }}>
                                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px' }}><ChevronLeft size={20} /></Button>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{page} / {totalPages}</span>
                                    <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '8px' }}><ChevronRight size={20} /></Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card style={{ textAlign: 'center', padding: '80px 40px' }}>
                            <Search size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
                            <h2 style={{ color: '#1e293b' }}>No matches found</h2>
                            <p style={{ color: 'var(--text-gray)', maxWidth: '400px', margin: '10px auto 30px' }}>We couldn't find any courses matching your search. Try different keywords or filter by another category.</p>
                            <Button onClick={() => navigate('/student/search')}>Reset All Filters</Button>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchResults;
