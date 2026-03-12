import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layout/AdminLayout';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line,
} from 'recharts';
import { Users, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const AdminAnalytics = () => {
    const [overview, setOverview] = useState(null);
    const [deptData, setDeptData] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [skillData, setSkillData] = useState([]);
    const [levelData, setLevelData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [ov, dep, yr, sk, lv] = await Promise.all([
                    axios.get('/api/analytics/overview'),
                    axios.get('/api/analytics/department'),
                    axios.get('/api/analytics/year'),
                    axios.get('/api/analytics/skill'),
                    axios.get('/api/analytics/level'),
                ]);
                setOverview(ov.data);
                setDeptData(dep.data || []);
                setYearData(yr.data || []);
                setSkillData(sk.data || []);
                setLevelData(lv.data || []);
            } catch (err) {
                console.error('Analytics fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <AdminLayout><Loader /></AdminLayout>;

    const statCards = [
        { label: 'Total Students', value: overview?.totalStudents || 0, icon: <Users size={22} />, color: '#6366f1' },
        { label: 'Published Courses', value: overview?.totalCourses || 0, icon: <BookOpen size={22} />, color: '#8b5cf6' },
        { label: 'Total Enrollments', value: overview?.totalEnrollments || 0, icon: <TrendingUp size={22} />, color: '#06b6d4' },
        { label: 'Completion Rate', value: `${overview?.completionRate || 0}%`, icon: <CheckCircle size={22} />, color: '#10b981' },
    ];

    return (
        <AdminLayout>
            <div>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 className="page-title">Platform Analytics</h1>
                    <p className="page-subtitle">Comprehensive insights into student engagement and course performance</p>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    {statCards.map((s, i) => (
                        <Card key={i} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${s.color}20`, color: s.color }}>
                                {s.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{s.label}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Monthly Enrollment Trend */}
                {overview?.monthlyData && (
                    <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Monthly Enrollment Trend (Last 6 Months)</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={overview.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Enrollments" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Department-wise Bar Chart */}
                    <Card style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Students by Department</h3>
                        {deptData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={deptData} margin={{ bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No department data yet.</p>}
                    </Card>

                    {/* Year-wise Bar Chart */}
                    <Card style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Students by Year of Study</h3>
                        {yearData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={yearData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No year data yet.</p>}
                    </Card>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {/* Skill Distribution Pie Chart */}
                    <Card style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Enrollment by Skill Category</h3>
                        {skillData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={skillData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {skillData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No skill data yet.</p>}
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
