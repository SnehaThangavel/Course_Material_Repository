import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

import { TrendingUp, CheckCircle, BookOpen, Award, Download, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const StudentAnalytics = () => {
    const { user } = React.useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: res } = await axios.get('/api/analytics/student-overview');
                setData(res);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const generatePDF = async () => {
        setIsDownloading(true);
        const reportElement = document.getElementById('analytics-report-content');
        
        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate PDF dimensions based on A4 ratio
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${user?.name?.replace(/\s+/g, '_') || 'student'}_analytics_report.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // SVG Radial Progress Component (from Progress.jsx)
    const RadialProgress = ({ percentage }) => {
        const radius = 80;
        const stroke = 12;
        const normalizedRadius = radius - stroke * 2;
        const circumference = normalizedRadius * 2 * Math.PI;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                >
                    <circle
                        stroke="var(--surface-muted)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke="var(--primary)"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' }}>{percentage}%</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance</div>
                </div>
            </div>
        );
    };

    if (loading) return <StudentLayout><Loader /></StudentLayout>;

    // Calculate Overall Performance % (based on Levels Completed vs Estimated Total Levels if we had that, 
    // but we'll use average progress across enrolled courses for a better "velocity" feel)
    const avgProgress = data?.courseProgress?.length > 0
        ? Math.round(data.courseProgress.reduce((sum, cp) => sum + cp.progress, 0) / data.courseProgress.length)
        : 0;

    const completedCourses = data?.courseProgress?.filter(cp => cp.progress >= 100).length || 0;
    const courseCompletionPercentage = data?.totalEnrolled > 0 ? Math.round((completedCourses / data.totalEnrolled) * 100) : 0;

    const stats = [
        { label: 'Ongoing Courses', value: data?.totalEnrolled || 0, icon: <BookOpen size={22} />, color: '#6366f1', link: '/student/courses' },
        { label: 'Levels Completed', value: data?.completedCount || 0, icon: <CheckCircle size={22} />, color: '#10b981', link: '/student/courses?filter=completed' },
    ];

    return (
        <StudentLayout>
            <div style={{ paddingBottom: '3rem' }}>
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-title">Learning Analytics</h1>
                        <p className="page-subtitle">Strategic analysis of your academic commitments and objectives.</p>
                    </div>
                    {!isDownloading && (
                        <button 
                            onClick={generatePDF}
                            disabled={isDownloading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1.5rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: isDownloading ? 'not-allowed' : 'pointer',
                                opacity: isDownloading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => !isDownloading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !isDownloading && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <Download size={18} />
                            {isDownloading ? 'Generating...' : 'Download PDF Report'}
                        </button>
                    )}
                </div>

                {/* PDF capture wrapper */}
                <div id="analytics-report-content" style={{ padding: isDownloading ? '2rem' : '0', background: isDownloading ? 'var(--bg)' : 'transparent', borderRadius: isDownloading ? '16px' : '0' }}>
                    
                    {/* Student Profile Header (Only highly styled for the report) */}
                    <Card style={{ padding: '2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)', border: '1px solid var(--border)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)' }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>{user?.name || 'Student Name'}</h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <span style={{ padding: '4px 8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>{user?.rollNumber || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <span style={{ padding: '4px 8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>{user?.department || 'Department Not Set'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <span style={{ padding: '4px 8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>{user?.email || 'email@example.com'}</span>
                                </div>
                            </div>
                        </div>
                        {isDownloading && (
                             <div style={{ textAlign: 'right' }}>
                                 <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Report Generated</div>
                                 <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                             </div>
                        )}
                    </Card>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {stats.map((s, i) => (
                        <Link to={s.link} key={i} style={{ textDecoration: 'none' }}>
                            <Card style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }} className="hover:shadow-lg transition-all duration-200">
                                <div style={{ padding: '1rem', borderRadius: '16px', background: `${s.color}15`, color: s.color }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.25rem' }}>
                                        {s.display || s.value}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{s.label}</div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Course Completion Table */}
                <Card style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Course Completion Details</h3>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {data?.tableData?.length || 0} records found
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                    {['Course Details', 'Level', 'Progress', 'Status'].map(h => (
                                        <th key={h} style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(!data?.tableData || data.tableData.length === 0) ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontWeight: 600 }}>No course data available.</td></tr>
                                ) : data.tableData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{row.courseTitle}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{row.skillCategory}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                                                {row.level}
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

                {/* Overall Performance */}
                <Card style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <TrendingUp size={22} style={{ color: 'var(--primary)' }} />
                            Comprehensive Performance Overview
                        </h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
                        {/* Left: Radial Progress */}
                        <div style={{ flex: '1 1 300px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border)' }}>
                            <RadialProgress percentage={avgProgress} />
                            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', maxWidth: '220px', lineHeight: 1.5 }}>
                                Overall progress across your active learning modules.
                            </p>
                        </div>
                        
                        {/* Right: Detailed Stats */}
                        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                            {/* Course Completion Stat */}
                            <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #e0f2fe, #fff)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <BookOpen size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.4rem' }}>{courseCompletionPercentage}%</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Repository Completion</div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        Percentage of completely verified materials out of all enrolled modules.
                                    </p>
                                </div>
                            </div>


                        </div>
                    </div>
                </Card>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentAnalytics;
