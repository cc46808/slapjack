// slapjack/client/src/components/ui/Button.jsx
import React from 'react';

export const Button = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none';
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-gray-300 hover:bg-gray-100'
  };
  const sizeStyles = {
    default: 'h-10 px-4 py-2',
    small: 'h-8 px-3 py-1',
    large: 'h-12 px-6 py-3'
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    />
  );
});