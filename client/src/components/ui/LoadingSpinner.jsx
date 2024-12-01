// slapjack/client/src/components/ui/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);