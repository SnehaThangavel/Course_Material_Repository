import React from 'react';
import '../../styles/components.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`btn btn-${variant}`}
            disabled={disabled}
            style={{ opacity: disabled ? 0.7 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            {children}
        </button>
    );
};

export default Button;
