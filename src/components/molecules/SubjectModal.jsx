import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Card from '@/components/atoms/Card'

const SubjectModal = ({ isOpen, onClose, onSave, onDelete, subject, mode }) => {
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday',
    slots: ['08:00 - 08:45'],
    className: 'Grade 5A',
    subject: '',
    duration: 45
  })

  const [errors, setErrors] = useState({})

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  useEffect(() => {
    if (mode === 'edit' && subject) {
      setFormData({
        dayOfWeek: subject.dayOfWeek,
        slots: subject.slots,
        className: subject.className,
        subject: subject.subject,
        duration: subject.duration
      })
    } else {
      setFormData({
        dayOfWeek: 'Monday',
        slots: ['08:00 - 08:45'],
        className: 'Grade 5A',
        subject: '',
        duration: 45
      })
    }
    setErrors({})
  }, [mode, subject])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject name is required'
    }
    
    if (!formData.className.trim()) {
      newErrors.className = 'Class name is required'
    }
    
    if (formData.duration < 15 || formData.duration > 180) {
      newErrors.duration = 'Duration must be between 15 and 180 minutes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const generateTimeSlot = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    
    return `${startTime} - ${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  const handleTimeChange = (startTime) => {
    const timeSlot = generateTimeSlot(startTime, formData.duration)
    handleInputChange('slots', [timeSlot])
  }

  const handleDurationChange = (duration) => {
    handleInputChange('duration', duration)
    const [startTime] = formData.slots[0].split(' - ')
    const timeSlot = generateTimeSlot(startTime, duration)
    handleInputChange('slots', [timeSlot])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Name
              </label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="e.g., Mathematics, Science, English"
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name
              </label>
              <Input
                type="text"
                value={formData.className}
                onChange={(e) => handleInputChange('className', e.target.value)}
                placeholder="e.g., Grade 5A, Class 10B"
                className={errors.className ? 'border-red-500' : ''}
              />
              {errors.className && (
                <p className="text-sm text-red-600 mt-1">{errors.className}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => handleInputChange('dayOfWeek', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <select
                value={formData.slots[0].split(' - ')[0]}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                min="15"
                max="180"
                step="15"
                className={errors.duration ? 'border-red-500' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Time slot: {formData.slots[0]}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary text-white hover:opacity-90"
              >
                {mode === 'edit' ? 'Update Subject' : 'Create Subject'}
              </Button>
              
              {mode === 'edit' && onDelete && (
                <Button
                  type="button"
                  onClick={onDelete}
                  className="px-4 bg-red-600 text-white hover:bg-red-700"
                >
                  <ApperIcon name="Trash2" size={16} />
                </Button>
              )}
              
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="px-4"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default SubjectModal