import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, UserCircle, PlusCircle, LogOut, MessageSquare, BarChart3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
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
                    <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        <span>Overview</span>
                    </NavLink>

                    <NavLink to="/admin/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BookOpen size={18} />
                        <span>Curriculum</span>
                    </NavLink>

                    <NavLink to="/admin/add-course" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <PlusCircle size={18} />
                        <span>New Course</span>
                    </NavLink>

                    <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BarChart3 size={18} />
                        <span>Analytics</span>
                    </NavLink>

                    <NavLink to="/admin/feedbacks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <MessageSquare size={18} />
                        <span>Engagement</span>
                    </NavLink>

                    <NavLink to="/admin/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <UserCircle size={18} />
                        <span>Profile Admin</span>
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
                    <div className="header-portal-name">Governance Node</div>
                    <div className="header-user-info">
                        <div className="header-welcome">Superuser Identified: <strong>{user?.name || 'Admin'}</strong></div>
                        <div className="avatar">
                            {user?.name?.charAt(0) || 'A'}
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

export default AdminLayout;
