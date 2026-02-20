import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname.includes(path);

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        <i className="fa-solid fa-book-open" style={{ marginRight: '10px' }}></i>
                        CMR
                    </h2>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {user?.role === 'admin' ? (
                            <>
                                <li>
                                    <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-chart-pie"></i> Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-layer-group"></i> Manage Courses
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/add-course" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-plus-circle"></i> Add Course
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-user-shield"></i> Admin Profile
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink to="/student/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-house"></i> Dashboard
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/student/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-graduation-cap"></i> My Courses
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/student/progress" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-chart-line"></i> Progress
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/student/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                                        <i className="fa-solid fa-user"></i> My Profile
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                <div style={{ padding: '20px' }}>
                    <div className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer', color: 'var(--danger)' }}>
                        <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                <header className="top-navbar">
                    <h3 style={{ margin: 0 }}>
                        {user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
                    </h3>
                    <div className="user-profile">
                        <span>Welcome, <strong>{user?.name}</strong></span>
                        <div className="avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <main className="content-wrapper">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
