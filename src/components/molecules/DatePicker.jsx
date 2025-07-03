import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'

const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Select date",
  error,
  className = '',
  mode = 'single', // 'single', 'multiple', 'range'
  showCalendar: externalShowCalendar = false
}) => {
  const [showCalendar, setShowCalendar] = useState(externalShowCalendar)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState([])
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [hoverDate, setHoverDate] = useState(null)

  // Initialize state based on mode and value
  useEffect(() => {
    if (mode === 'single') {
      // Keep existing single date behavior
    } else if (mode === 'multiple' && Array.isArray(value)) {
      setSelectedDates(value)
    } else if (mode === 'range' && value) {
      if (value.start) setRangeStart(value.start)
      if (value.end) setRangeEnd(value.end)
    }
  }, [value, mode])

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    onChange(dateValue ? new Date(dateValue) : null)
  }

  const handleCalendarDateClick = (date) => {
    if (mode === 'single') {
      onChange(date)
      setShowCalendar(false)
    } else if (mode === 'multiple') {
      const newSelectedDates = selectedDates.some(d => isSameDay(d, date))
        ? selectedDates.filter(d => !isSameDay(d, date))
        : [...selectedDates, date]
      setSelectedDates(newSelectedDates)
      onChange(newSelectedDates)
    } else if (mode === 'range') {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(date)
        setRangeEnd(null)
        onChange({ start: date, end: null })
      } else {
        // Complete range
        const start = date < rangeStart ? date : rangeStart
        const end = date < rangeStart ? rangeStart : date
        setRangeStart(start)
        setRangeEnd(end)
        onChange({ start, end })
      }
    }
  }

  const formatInputValue = (date) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd')
  }

  const formatDisplayValue = () => {
    if (mode === 'single') {
      return value ? format(value, 'MMM d, yyyy') : placeholder
    } else if (mode === 'multiple') {
      if (selectedDates.length === 0) return placeholder
      if (selectedDates.length === 1) return format(selectedDates[0], 'MMM d, yyyy')
      return `${selectedDates.length} dates selected`
    } else if (mode === 'range') {
      if (!rangeStart) return placeholder
      if (!rangeEnd) return `${format(rangeStart, 'MMM d, yyyy')} - ...`
      return `${format(rangeStart, 'MMM d, yyyy')} - ${format(rangeEnd, 'MMM d, yyyy')}`
    }
    return placeholder
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get first day of the week (Sunday = 0)
    const firstDayOfMonth = monthStart.getDay()
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

    const isDateSelected = (date) => {
      if (mode === 'single') return value && isSameDay(date, value)
      if (mode === 'multiple') return selectedDates.some(d => isSameDay(d, date))
      if (mode === 'range') {
        if (rangeStart && isSameDay(date, rangeStart)) return true
        if (rangeEnd && isSameDay(date, rangeEnd)) return true
        return false
      }
      return false
    }

    const isDateInRange = (date) => {
      if (mode !== 'range') return false
      if (!rangeStart) return false
      
      if (rangeEnd) {
        return isWithinInterval(date, { start: rangeStart, end: rangeEnd })
      } else if (hoverDate && hoverDate > rangeStart) {
        return isWithinInterval(date, { start: rangeStart, end: hoverDate })
      }
      return false
    }

    const isDateRangeEnd = (date) => {
      if (mode !== 'range') return false
      return (rangeStart && isSameDay(date, rangeStart)) || (rangeEnd && isSameDay(date, rangeEnd))
    }

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ApperIcon name="ChevronLeft" size={16} />
          </button>
          <h3 className="font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ApperIcon name="ChevronRight" size={16} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {emptyDays.map(day => (
            <div key={`empty-${day}`} className="w-8 h-8" />
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map(date => {
            const isSelected = isDateSelected(date)
            const isInRange = isDateInRange(date)
            const isRangeEndpoint = isDateRangeEnd(date)
            
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleCalendarDateClick(date)}
                onMouseEnter={() => mode === 'range' && setHoverDate(date)}
                onMouseLeave={() => mode === 'range' && setHoverDate(null)}
                className={`
                  w-8 h-8 text-sm rounded transition-colors
                  ${isSelected || isRangeEndpoint 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : isInRange 
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>

        {/* Mode indicator and actions */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 capitalize">
              {mode} selection mode
            </span>
            {(mode === 'multiple' || mode === 'range') && (
              <button
                type="button"
                onClick={() => {
                  if (mode === 'multiple') {
                    setSelectedDates([])
                    onChange([])
                  } else if (mode === 'range') {
                    setRangeStart(null)
                    setRangeEnd(null)
                    onChange({ start: null, end: null })
                  }
                }}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For single mode, render the original input-based picker
  if (mode === 'single' && !externalShowCalendar) {
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

  // For advanced modes or when explicitly showing calendar
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
        
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={`
            block w-full pl-10 pr-10 py-2.5 border rounded-lg shadow-sm text-left
            focus:border-primary-500 focus:ring-primary-500 bg-white
            ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : 'border-gray-300'}
          `}
        >
          <span className={value || selectedDates.length > 0 || rangeStart ? 'text-gray-900' : 'text-gray-500'}>
            {formatDisplayValue()}
          </span>
        </button>

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ApperIcon 
            name={showCalendar ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-gray-400" 
          />
        </div>
        
        {showCalendar && renderCalendar()}
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