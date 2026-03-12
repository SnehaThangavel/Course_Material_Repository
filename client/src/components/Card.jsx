import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`card ${className}`} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-soft)', border: '1px solid rgba(255,255,255,0.8)' }} {...props}>
            {children}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Card;
