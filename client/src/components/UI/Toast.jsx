import React, { useEffect, useState } from 'react';
import '../../styles/pages.css';

const Toast = ({ message, type, onClose, duration = 3000 }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast-container ${visible ? 'fade-in' : 'fade-out'}`}>
            <div className={`toast toast-${type}`}>
                <div className="toast-icon">
                    <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                </div>
                <div className="toast-message">{message}</div>
                <button className="toast-close" onClick={() => setVisible(false)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    );
};

export default Toast;
