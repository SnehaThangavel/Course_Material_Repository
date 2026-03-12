import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseClass = variant === 'primary' ? 'btn-primary'
        : variant === 'secondary' ? 'btn-secondary'
            : variant === 'danger' ? 'btn-danger'
                : 'btn-secondary';

    return (
        <button
            className={`${baseClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
    className: PropTypes.string,
};

export default Button;
