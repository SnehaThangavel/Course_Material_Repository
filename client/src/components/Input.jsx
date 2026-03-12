import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                ref={ref}
                className={`input-field ${error ? 'input-field-error' : ''}`}
                {...props}
            />
            {error && <span className="input-error-message" style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    label: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string,
};

export default Input;
