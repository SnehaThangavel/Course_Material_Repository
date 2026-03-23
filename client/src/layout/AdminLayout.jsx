import React, { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, UserCircle, PlusCircle, LogOut, MessageSquare, BarChart3, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
    const { logout, user } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout-wrapper">
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div 
                        className="sidebar-logo" 
                        onClick={() => isCollapsed && setIsCollapsed(false)}
                        title={isCollapsed ? "Expand Sidebar" : ""}
                        style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
                    >
                        <div className="icon-box">
                            <BookOpen size={22} strokeWidth={2.5} />
                        </div>
                        {!isCollapsed && <span>CourseHub</span>}
                    </div>
                    {!isCollapsed && (
                        <button 
                            className="sidebar-toggle-btn"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title="Collapse Sidebar"
                        >
                            <Menu size={20} />
                        </button>
                    )}
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

                <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button 
                        onClick={handleLogout} 
                        className="nav-item logout-btn" 
                        title="Sign Out"
                        style={{ width: '100%', margin: '0', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="header-bar">
                    <div className="header-portal-name">Governance Node</div>
                    <div className="header-user-info">
                        <Link to="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                            <div className="header-welcome">Superuser Identified: <strong>{user?.name || 'Admin'}</strong></div>
                            <div className="avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                        </Link>
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
