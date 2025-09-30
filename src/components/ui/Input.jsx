import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ 
  type = 'text',
  className,
  error,
  label,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-100 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={clsx(
          'bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 w-full',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
