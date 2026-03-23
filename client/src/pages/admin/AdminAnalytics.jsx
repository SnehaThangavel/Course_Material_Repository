import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
    Users, BookOpen, TrendingUp, CheckCircle,
    Filter, Download, ChevronDown, ChevronUp,
    Search, X, FileText, Table as TableIcon,
    ArrowUpDown, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const AdminAnalytics = () => {
    // --- State Management ---
    const [overview, setOverview] = useState(null);
    const [deptData, setDeptData] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [skillData, setSkillData] = useState([]);
    const [courseList, setCourseList] = useState([]);
    const [detailedData, setDetailedData] = useState([]);
    const [metrics, setMetrics] = useState(null);

    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [filterOpen, setFilterOpen] = useState(true);
    const [trendType, setTrendType] = useState('daily');
    const [searchTerm, setSearchTerm] = useState('');

    // --- Filter State ---
    const [filters, setFilters] = useState({
        department: [],
        year: [],
        skillCategory: [],
        courseId: [],
        level: [],
        studentName: []
    });
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    // --- Static Filter Options ---
    const DEPARTMENTS = [
        'Artificial Intelligence and Data Science',
        'Artificial Intelligence and Machine Learning',
        'Biotechnology',
        'Computer Science',
        'Computer Science and Business Systems',
        'Electrical and Electronics',
        'Electrical Communication',
        'Fashion Technology',
        'Food Technology',
        'Information Science',
        'Information Technology',
        'MBA',
        'Mechanical'
    ];
    const YEARS = [1, 2, 3, 4];
    const SKILLS = ['Software', 'Hardware', 'General'];
    const LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];

    // --- Initial Data Fetch ---
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [ov, dep, yr, sk, cl] = await Promise.all([
                    axios.get('/api/analytics/overview'),
                    axios.get('/api/analytics/department'),
                    axios.get('/api/analytics/year'),
                    axios.get('/api/analytics/skill'),
                    axios.get('/api/analytics/published-courses'),
                ]);
                setOverview(ov.data);
                setDeptData(dep.data || []);
                setYearData(yr.data || []);
                setSkillData(sk.data || []);
                setCourseList(cl.data || []);
            } catch (err) {
                console.error('Initial analytics fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    // --- Detailed Filtered Data Fetch ---
    const fetchDetailed = async () => {
        setTableLoading(true);
        try {
            // Build query params for arrays (department[]=CSE&department[]=ECE)
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, values]) => {
                values.forEach(val => {
                    params.append(key, val);
                });
            });

            const { data } = await axios.get(`/api/analytics/detailed?${params.toString()}`);
            setDetailedData(data.tableData || []);
            setMetrics(data.metrics);
        } catch (err) {
            console.error('Detailed analytics fetch error:', err);
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailed();
    }, []); // Initial load

    // --- Filter Logic ---
    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            return {
                ...prev,
                [type]: current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value]
            };
        });
    };

    const clearFilters = () => {
        setFilters({ department: [], year: [], skillCategory: [], courseId: [], level: [], studentName: [] });
        setSearchTerm('');
    };

    // --- Table Processing ---
    const filteredAndSearchedData = useMemo(() => {
        let data = detailedData;
        
        if (filters.studentName && filters.studentName.length > 0) {
            data = data.filter(row => filters.studentName.includes(row.studentName));
        }

        if (!searchTerm) return data;
        const lowSearch = searchTerm.toLowerCase();
        return data.filter(row => 
            row.studentName.toLowerCase().includes(lowSearch) ||
            row.rollNumber.toLowerCase().includes(lowSearch) ||
            row.courseTitle.toLowerCase().includes(lowSearch)
        );
    }, [detailedData, searchTerm, filters.studentName]);

    const autocompleteSuggestions = useMemo(() => {
        if (!searchTerm) return [];
        const lowSearch = searchTerm.toLowerCase();
        const uniqueNames = new Set();
        detailedData.forEach(row => {
            if (row.studentName.toLowerCase().includes(lowSearch)) {
                uniqueNames.add(row.studentName);
            }
        });
        return Array.from(uniqueNames).slice(0, 5);
    }, [detailedData, searchTerm]);

    // --- Export Functions ---
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredAndSearchedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DetailedAnalytics");
        XLSX.writeFile(wb, `CourseHub_Analytics_${new Date().toLocaleDateString()}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.text("CourseHub - Detailed Student Analytics Report", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        let filterY = 30;
        let activeFiltersText = [];
        if (searchTerm) activeFiltersText.push(`Search: ${searchTerm}`);
        Object.entries(filters).forEach(([key, values]) => {
            if (values && values.length > 0) {
                const label = key === 'courseId' ? 'Course' : key === 'studentName' ? 'Student' : key.charAt(0).toUpperCase() + key.slice(1);
                const displayValues = key === 'courseId' ? values.map(v => {
                    const c = courseList.find(course => course._id === v);
                    return c ? c.title : v;
                }) : values;
                activeFiltersText.push(`${label}: ${displayValues.join(', ')}`);
            }
        });

        if (activeFiltersText.length > 0) {
            doc.text("Applied Filters:", 14, filterY);
            doc.setFontSize(9);
            const splitText = doc.splitTextToSize(activeFiltersText.join(' | '), 270);
            doc.text(splitText, 14, filterY + 5);
            filterY += 5 + (splitText.length * 5);
        } else {
            filterY = 30;
        }

        const tableColumn = ["Student Name", "Roll No", "Dept", "Year", "Course", "Level", "Status", "Progress (%)"];
        const tableRows = filteredAndSearchedData.map(row => [
            row.studentName,
            row.rollNumber,
            row.department,
            row.year,
            row.courseTitle,
            row.level,
            row.status,
            `${row.progress}%`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: filterY + 4,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241] }
        });
        doc.save(`CourseHub_Analytics_${new Date().toLocaleDateString()}.pdf`);
    };

    // --- Chart Interactivity ---
    const onChartClick = (type, value) => {
        toggleFilter(type, value);
    };

    if (loading) return <AdminLayout><Loader /></AdminLayout>;

    const statCards = [
        { label: 'Total Students', value: overview?.totalStudents || 0, icon: <Users size={22} />, color: '#6366f1', link: '/admin/students-list' },
        { label: 'Published Courses', value: overview?.totalCourses || 0, icon: <BookOpen size={22} />, color: '#8b5cf6', link: '/admin/published-courses' },
        { label: 'Total Enrollments', value: overview?.totalEnrollments || 0, icon: <TrendingUp size={22} />, color: '#06b6d4', link: '/admin/enrollment-details' },
        { label: 'Completed Courses', value: overview?.completedCount || 0, icon: <CheckCircle size={22} />, color: '#10b981', link: '/admin/completed-details' },
    ];

    // --- UI Helper: Dropdown Filter Group ---
    const FilterDropdown = ({ title, options, type, displayProp = (val) => val, valueProp = (val) => val }) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectedCount = filters[type].length;

        return (
            <div style={{ position: 'relative', minWidth: '160px' }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%', padding: '0.6rem 1rem', borderRadius: '10px',
                        border: `1.5px solid ${selectedCount > 0 ? 'var(--primary)' : 'var(--border)'}`,
                        background: selectedCount > 0 ? 'var(--primary-light)' : 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        color: selectedCount > 0 ? 'var(--primary)' : 'var(--text-main)'
                    }}
                >
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedCount > 0 ? `${title} (${selectedCount})` : title}
                    </span>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isOpen && (
                    <>
                        <div
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <Card style={{
                            position: 'absolute', top: '110%', left: 0, minWidth: '240px',
                            maxHeight: '300px', overflowY: 'auto', zIndex: 999, padding: '0.75rem',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid var(--border)'
                        }} className="custom-scroll">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{title}</span>
                                {selectedCount > 0 && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setFilters(prev => ({ ...prev, [type]: [] }))}>Clear</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {options.map((opt, i) => {
                                    const label = displayProp(opt);
                                    const val = valueProp(opt);
                                    const isChecked = filters[type].includes(val);
                                    return (
                                        <label key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem',
                                            borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                                            background: isChecked ? 'var(--primary-light)' : 'transparent',
                                            color: isChecked ? 'var(--primary)' : 'var(--text-main)',
                                            transition: 'background 0.2s'
                                        }} className="hover:bg-slate-50">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleFilter(type, val)}
                                                style={{ width: '14px', height: '14px', accentColor: 'var(--primary)' }}
                                            />
                                            {label}
                                        </label>
                                    );
                                })}
                            </div>
                        </Card>
                    </>
                )}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div style={{ paddingBottom: '4rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="page-title">Advanced Analytics</h1>
                        <p className="page-subtitle">Interactive data filtering and student performance tracking</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={exportExcel} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                            <TableIcon size={16} /> Excel
                        </button>
                        <button onClick={exportPDF} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                            <FileText size={16} /> PDF
                        </button>
                    </div>
                </div>

                {/* Horizontal Filters at Top */}
                <Card style={{ padding: '1rem', marginBottom: '1.5rem', background: '#f8fafc', position: 'relative', zIndex: 100 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                            <Filter size={18} />
                        </div>

                        <FilterDropdown title="Department" options={DEPARTMENTS} type="department" />
                        <FilterDropdown title="Year" options={YEARS} type="year" displayProp={y => `Year ${y}`} />
                        <FilterDropdown title="Skill" options={SKILLS} type="skillCategory" />
                        <FilterDropdown title="Level" options={LEVELS} type="level" />
                        <FilterDropdown title="Course" options={courseList} type="courseId" displayProp={c => c.title} valueProp={c => c._id} />

                        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowAutocomplete(true);
                                }}
                                onFocus={() => setShowAutocomplete(true)}
                                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '0.85rem', outline: 'none' }}
                            />
                            {showAutocomplete && autocompleteSuggestions.length > 0 && (
                                <Card style={{ 
                                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                                    zIndex: 1000, padding: '0.5rem', border: '1px solid var(--border)',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}>
                                    {autocompleteSuggestions.map((name, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => {
                                                toggleFilter('studentName', name);
                                                setSearchTerm('');
                                                setShowAutocomplete(false);
                                            }}
                                            style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem' }}
                                            className="hover:bg-slate-50"
                                        >
                                            {name}
                                        </div>
                                    ))}
                                </Card>
                            )}
                        </div>

                        <button onClick={fetchDetailed} className="btn-primary" style={{ padding: '0.6rem 1.25rem', height: 'auto', fontWeight: 800 }}>
                            Apply
                        </button>
                        <button onClick={clearFilters} className="btn-secondary" style={{ padding: '0.6rem 1rem', height: 'auto', fontWeight: 700 }}>
                            Reset
                        </button>
                    </div>
                </Card>

                {/* Applied Filters Chips */}
                {Object.values(filters).some(arr => arr.length > 0) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.4rem' }}>Applied Filters:</span>
                        {Object.entries(filters).map(([type, values]) =>
                            values.map((val, idx) => {
                                let label = val;
                                if (type === 'year') label = `Year ${val}`;
                                if (type === 'courseId') {
                                    const course = courseList.find(c => c._id === val);
                                    label = course ? course.title : val;
                                }
                                return (
                                    <div key={`${type}-${idx}`} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem',
                                        background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px',
                                        fontSize: '0.85rem', fontWeight: 700, border: '1px solid var(--primary-border)'
                                    }}>
                                        <span style={{ opacity: 0.7, fontSize: '0.75rem', textTransform: 'uppercase' }}>{type.replace('Category', '').replace('Id', '')}:</span>
                                        {label}
                                        <X
                                            size={12}
                                            style={{ cursor: 'pointer', marginLeft: '0.2rem' }}
                                            onClick={() => toggleFilter(type, val)}
                                        />
                                    </div>
                                );
                            })
                        )}
                        <button
                            onClick={clearFilters}
                            style={{
                                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
                                padding: '0.25rem 0.5rem'
                            }}
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Detailed Table (Middle) */}
                <Card style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>Filtered Student Data</h3>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {filteredAndSearchedData.length} records found
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                    {['Roll No', 'Student Name', 'Department', 'Year', 'Course Details', 'Level', 'Progress', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableLoading ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}><Loader /></td></tr>
                                ) : filteredAndSearchedData.length === 0 ? (
                                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontWeight: 600 }}>No matching data.</td></tr>
                                ) : filteredAndSearchedData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 700 }}>{row.rollNumber}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{row.studentName}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{row.department}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>Year {row.year}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{row.courseTitle}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{row.skillCategory}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                                                {row.level === 'Full Course' ? 'Level 1' : row.level}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ width: '100px', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                                                <div style={{ width: `${row.progress}%`, height: '100%', background: row.progress === 100 ? '#10b981' : 'var(--primary)', borderRadius: '10px' }}></div>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-main)' }}>{row.progress}%</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                                                background: row.status === 'Completed' ? '#d1fae5' : '#fef3c7',
                                                color: row.status === 'Completed' ? '#059669' : '#d97706'
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>


            </div>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 5px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </AdminLayout>
    );
};

export default AdminAnalytics;
