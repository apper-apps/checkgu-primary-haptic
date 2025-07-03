import { useState } from 'react'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'

const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Select date",
  error,
  className = ''
}) => {
  const [showCalendar, setShowCalendar] = useState(false)
  
  const handleDateChange = (e) => {
    const dateValue = e.target.value
    onChange(dateValue ? new Date(dateValue) : null)
  }

  const formatInputValue = (date) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd')
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ApperIcon name="Calendar" size={16} className="text-gray-400" />
        </div>
        
        <input
          type="date"
          value={formatInputValue(value)}
          onChange={handleDateChange}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-4 py-2.5 border rounded-lg shadow-sm
            focus:border-primary-500 focus:ring-primary-500
            ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : 'border-gray-300'}
          `}
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
}

export default DatePicker