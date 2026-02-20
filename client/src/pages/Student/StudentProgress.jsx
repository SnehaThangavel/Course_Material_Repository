import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { Calendar, CheckCircle, Clock, TrendingUp, Download } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pages.css';

const StudentProgress = () => {
    const [progressData, setProgressData] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [stats, setStats] = useState({
        completed: 0,
        enrolled: 0,
        overallPercentage: 0
    });
    const [loading, setLoading] = useState(true);

    const exportToCSV = () => {
        const headers = ['Course Title', 'Progress (%)', 'Status'];
        const rows = progressData.map(p => [
            p.title,
            p.percentage,
            p.completed ? 'Completed' : 'In Progress'
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Learning_Progress_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [progressRes, activityRes] = await Promise.all([
                    api.get('/courses/student/progress'),
                    api.get('/courses/student/activity')
                ]);

                // New API returns { progress, overallPercentage, totalCourses, completedCount }
                const progressPayload = progressRes.data;
                const progress = Array.isArray(progressPayload) ? progressPayload : (progressPayload.progress || []);
                const overallPercentage = progressPayload.overallPercentage ?? 0;
                const completedCount = progressPayload.completedCount ?? progress.filter(p => p.completed).length;

                setProgressData(progress);
                setActivityLogs(activityRes.data);
                setStats({
                    completed: completedCount,
                    enrolled: progress.length,
                    overallPercentage
                });
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartData = progressData.map(p => ({
        name: p.title.length > 15 ? p.title.substring(0, 12) + '...' : p.title,
        progress: p.percentage
    }));

    const lineData = [
        { day: 'Mon', count: 2 },
        { day: 'Tue', count: 5 },
        { day: 'Wed', count: 3 },
        { day: 'Thu', count: 8 },
        { day: 'Fri', count: 6 },
        { day: 'Sat', count: 4 },
        { day: 'Sun', count: 7 },
    ];

    if (loading) {
        return (
            <div className="content-wrapper">
                <div className="grid-3">
                    {[1, 2, 3].map(i => <Card key={i} className="loading-skeleton" style={{ height: '300px' }}></Card>)}
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Learning Analytics</h1>
                    <p style={{ color: 'var(--text-gray)' }}>Deep dive into your educational progress and trends.</p>
                </div>
                <Button variant="outline" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={18} /> Export Report
                </Button>
            </div>

            <div className="grid-3" style={{ marginBottom: '30px' }}>
                {/* Overall Completion — matches dashboard percentage */}
                <Card className="stat-card" style={{ borderLeft: '5px solid var(--primary-color)' }}>
                    <div className="stat-icon bg-blue-light"><TrendingUp size={24} /></div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.overallPercentage}%</h3>
                        <p style={{ color: 'var(--text-gray)', margin: 0 }}>Overall Completion</p>
                    </div>
                </Card>

                {/* Courses Completed — clickable, scrolls to completed section */}
                <Link to="#completed" className="no-underline" onClick={() => document.getElementById('completed-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Card className="stat-card clickable" style={{ borderLeft: '5px solid var(--success)' }}>
                        <div className="stat-icon bg-green-light"><CheckCircle size={24} /></div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.completed}</h3>
                            <p style={{ color: 'var(--text-gray)', margin: 0 }}>Courses Completed</p>
                        </div>
                    </Card>
                </Link>

                {/* Learning Activities — clickable, scrolls to activity section */}
                <Link to="#activity" className="no-underline" onClick={() => document.getElementById('activity-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Card className="stat-card clickable" style={{ borderLeft: '5px solid #eab308' }}>
                        <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}><Clock size={24} /></div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{activityLogs.length}</h3>
                            <p style={{ color: 'var(--text-gray)', margin: 0 }}>Learning Activities</p>
                        </div>
                    </Card>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <Card className="chart-container">
                    <h3 style={{ marginBottom: '20px' }}>Course Completion Progress</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="progress" fill="var(--primary-color)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="chart-container">
                    <h3 style={{ marginBottom: '20px' }}>Activity Trends</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--secondary-color)"
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: 'var(--secondary-color)', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <h2 id="activity-section" className="section-title">Recent Activity</h2>
            <Card style={{ padding: '0' }}>
                <div className="timeline" style={{ padding: '30px' }}>
                    {activityLogs.length > 0 ? (
                        activityLogs.slice(0, 5).map(log => (
                            <div key={log._id} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{log.action.replace(/_/g, ' ')}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                                            {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-gray)' }}>{log.details}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>No recent activity found.</p>
                    )}
                </div>
                {activityLogs.length > 5 && (
                    <div style={{ textAlign: 'center', padding: '15px', borderTop: '1px solid #f0f0f0' }}>
                        <Link to="/student/view-progress">
                            <Button variant="outline" style={{ fontSize: '0.8rem' }}>View All Activity</Button>
                        </Link>
                    </div>
                )}
            </Card>

            {progressData.filter(p => p.completed).length > 0 && (
                <div id="completed-section" style={{ marginTop: '40px' }}>
                    <h2 className="section-title">Completed Courses</h2>
                    <div className="grid-3">
                        {progressData.filter(p => p.completed).map(course => (
                            <Card key={course.courseId} style={{ borderLeft: '5px solid var(--success)' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <h3 style={{ margin: '0 0 5px' }}>{course.title}</h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Status: Finalized</span>
                                </div>
                                <Link to={`/student/course/${course.courseId}`}>
                                    <Button variant="primary" style={{ width: '100%', fontSize: '0.8rem' }}>Review Materials</Button>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProgress;
