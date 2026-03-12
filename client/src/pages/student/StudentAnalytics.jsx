import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentLayout from '../../layout/StudentLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area,
} from 'recharts';
import { TrendingUp, CheckCircle, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const StudentAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

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
        { label: 'Registered Courses', value: data?.totalEnrolled || 0, icon: <BookOpen size={22} />, color: '#6366f1', link: '/student/courses' },
        { label: 'Levels Completed', value: data?.completedCount || 0, icon: <CheckCircle size={22} />, color: '#10b981', link: '/student/courses?filter=completed' },
    ];

    return (
        <StudentLayout>
            <div style={{ paddingBottom: '3rem' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 className="page-title">Learning Analytics</h1>
                    <p className="page-subtitle">Strategic analysis of your academic commitments and objectives.</p>
                </div>

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

                {/* Overall Performance */}
                <Card style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem' }}>
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
                        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                            {/* Course Completion Stat */}
                            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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

                            <div style={{ width: 'calc(100% - 3rem)', height: '1px', background: 'var(--border)', margin: '0 auto' }}></div>

                            {/* Skill Areas Stat */}
                            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #fef3c7, #fff)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <Award size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, marginBottom: '0.4rem' }}>{data ? `${data.completedSkillCount || 0}/${data.studentSkillCount || 0}` : '0/0'}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Verified Skill Areas</div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        Domain categories you have explored and completed within the repository.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Skill Distribution Pie */}
                    <Card style={{ padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-main)' }}>Skill Distribution</h3>
                        {data?.skillData && data.skillData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={data.skillData}
                                        cx="50%" cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {data.skillData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Engagement data pending.</p>}
                    </Card>

                    {/* Growth Line Chart */}
                    <Card style={{ padding: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-main)' }}>Learning Trajectory</h3>
                        {data?.growthData && data.growthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={data.growthData}>
                                    <defs>
                                        <linearGradient id="colorLevels" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                    <Area type="monotone" dataKey="levels" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorLevels)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                                <p style={{ fontWeight: 600 }}>Milestones will appear here as you complete levels.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentAnalytics;
