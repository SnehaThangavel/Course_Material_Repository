import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, BookA, Compass, LayoutDashboard, LogOut, TrendingUp, UserCircle, BarChart3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const StudentLayout = ({ children }) => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout-wrapper">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="icon-box">
                        <BookOpen size={24} strokeWidth={2.5} />
                    </div>
                    <span>CourseHub</span>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/student" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/student/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BookA size={18} />
                        <span>My Library</span>
                    </NavLink>

                    <NavLink to="/student/discovery" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Compass size={18} />
                        <span>Discover</span>
                    </NavLink>

                    <NavLink to="/student/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BarChart3 size={18} />
                        <span>Analytics</span>
                    </NavLink>


                    <NavLink to="/student/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <UserCircle size={18} />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem' }}>
                    <button onClick={handleLogout} className="nav-item" style={{ width: 'calc(100% - 2rem)', margin: '0' }}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="header-bar">
                    <div className="header-portal-name">Academic Terminal</div>
                    <div className="header-user-info">
                        <div className="header-welcome">Active Session: <strong>{user?.name || 'Student'}</strong></div>
                        <div className="avatar">
                            {user?.name?.charAt(0) || 'S'}
                        </div>
                    </div>
                </header>
                <div className="page-container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
