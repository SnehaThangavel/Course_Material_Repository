import React from 'react';

const Skeleton = ({ className = '', style = {} }) => {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                backgroundColor: 'var(--border)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                borderRadius: 'var(--radius-md)',
                ...style
            }}
        >
            <style>
                {`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}
            </style>
        </div>
    );
};

export default Skeleton;
