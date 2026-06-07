import React from 'react';
import { cn } from '@/lib/utils';

const Button3D = React.forwardRef((
  { children, className, variant = 'pink', size = 'default', ...props },
  ref
) => {
  const baseClasses = 'button-3d px-6 py-3 text-sm font-bold uppercase tracking-wider';
  
  const variantClasses = {
    pink: 'button-3d-pink',
    purple: 'button-3d-purple',
    blue: 'button-3d-blue'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    default: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button3D.displayName = 'Button3D';

export default Button3D;