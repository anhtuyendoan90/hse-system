import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, leftIcon, rightIcon, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`form-group ${containerClassName}`}>
        {label && (
          <label className={`form-label ${required ? 'form-required' : ''}`}>
            {label}
          </label>
        )}
        <div className={leftIcon || rightIcon ? 'input-group' : ''}>
          {leftIcon && <span className="input-group-icon">{leftIcon}</span>}
          <input
            ref={ref}
            className={`form-input ${error ? 'error' : ''} ${className}`}
            {...props}
          />
          {rightIcon && <span className="input-group-suffix">{rightIcon}</span>}
        </div>
        {error && <div className="form-error">{error}</div>}
        {hint && !error && <div className="form-hint">{hint}</div>}
      </div>
    );
  }
);
Input.displayName = 'Input';
