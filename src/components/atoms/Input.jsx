import { forwardRef } from 'react'
import ApperIcon from '@/components/ApperIcon'

const Input = forwardRef(({ 
  label, 
  error, 
  icon, 
  type = 'text',
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} size={16} className="text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm 
            focus:border-primary-500 focus:ring-primary-500 
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error-600 flex items-center space-x-1">
          <ApperIcon name="AlertCircle" size={12} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input