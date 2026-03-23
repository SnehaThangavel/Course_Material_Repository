import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Info, Sparkles, RefreshCcw, Clock } from 'lucide-react';
import axios from 'axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get('http://127.0.0.1:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:5000/api/notifications/mark-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePopover = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            handleMarkRead();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_course': return <Sparkles size={18} />;
            case 'course_update': return <RefreshCcw size={18} />;
            default: return <Info size={18} />;
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={popoverRef}>
            <div className="notification-bell-container" onClick={togglePopover}>
                <Bell size={20} />
                {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
            </div>

            {isOpen && (
                <div className="notifications-popover">
                    <div className="notifications-header">
                        <span>Updates Hub</span>
                        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-light)', padding: '4px', borderRadius: '50%' }}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <div className="icon-bg">
                                    <Bell size={28} />
                                </div>
                                <p>All caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n._id} className={`notification-item type-${n.type}`}>
                                    <div className="notification-icon-wrapper">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-item-title">{n.title}</div>
                                        <div className="notification-item-msg">{n.message}</div>
                                        <div className="notification-item-time">
                                            <Clock size={12} />
                                            {formatDate(n.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
