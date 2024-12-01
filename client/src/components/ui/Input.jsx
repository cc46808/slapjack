// slapjack/client/src/components/ui/Input.jsx
import React from 'react';

export const Input = React.forwardRef(({
  className = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <input
      type={type}
      className={`
        w-full px-3 py-2 rounded-md border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
      ref={ref}
      {...props}
    />
  );
});