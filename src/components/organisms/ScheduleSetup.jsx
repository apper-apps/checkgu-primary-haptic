import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { weeklyScheduleService } from '@/services/api/weeklyScheduleService'

const ScheduleSetup = () => {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    className: '',
    subject: ''
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  const loadSchedule = async () => {
    setLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const data = await weeklyScheduleService.getAll()
      setSchedule(data)
    } catch (err) {
      setError('Failed to load schedule')
      console.error('Error loading schedule:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  const addSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.className || !newSlot.subject) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const slotData = {
        ...newSlot,
        slots: [`${newSlot.startTime} - ${newSlot.endTime}`],
        duration: calculateDuration(newSlot.startTime, newSlot.endTime)
      }
      
      await weeklyScheduleService.create(slotData)
      toast.success('Schedule slot added successfully')
      setNewSlot({
        dayOfWeek: 'Monday',
        startTime: '',
        endTime: '',
        className: '',
        subject: ''
      })
      loadSchedule()
    } catch (err) {
      toast.error('Failed to add schedule slot')
      console.error('Error adding slot:', err)
    }
  }

  const removeSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to remove this schedule slot?')) {
      try {
        await weeklyScheduleService.delete(slotId)
        toast.success('Schedule slot removed successfully')
        loadSchedule()
      } catch (err) {
        toast.error('Failed to remove schedule slot')
        console.error('Error removing slot:', err)
      }
    }
  }

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    return (end - start) / 60000 // duration in minutes
  }

  const getScheduleForDay = (day) => {
    return schedule.filter(slot => slot.dayOfWeek === day)
      .sort((a, b) => a.slots[0]?.localeCompare(b.slots[0]))
  }

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800',
      'Science': 'bg-green-100 text-green-800',
      'English': 'bg-purple-100 text-purple-800',
      'History': 'bg-yellow-100 text-yellow-800',
      'Geography': 'bg-indigo-100 text-indigo-800',
      'Art': 'bg-pink-100 text-pink-800',
      'Music': 'bg-red-100 text-red-800',
      'Physical Education': 'bg-orange-100 text-orange-800'
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <Loading type="schedule" />
  }

  if (error) {
    return <Error message={error} onRetry={loadSchedule} type="network" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Hide Form' : 'Add Schedule'}
        </Button>
      </div>

      {isEditing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Schedule Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
              <select
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <select
                value={newSlot.startTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <select
                value={newSlot.endTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <Input
              label="Class"
              value={newSlot.className}
              onChange={(e) => setNewSlot(prev => ({ ...prev, className: e.target.value }))}
              placeholder="Grade 5A"
            />

            <Input
              label="Subject"
              value={newSlot.subject}
              onChange={(e) => setNewSlot(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Mathematics"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              onClick={addSlot}
              icon="Plus"
            >
              Add Slot
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {daysOfWeek.map(day => (
          <Card key={day} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{day}</h3>
              <span className="text-sm text-gray-500">
                {getScheduleForDay(day).length} slots
              </span>
            </div>

            <div className="space-y-2">
              {getScheduleForDay(day).map((slot, index) => (
                <motion.div
                  key={slot.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <ApperIcon name="Clock" size={14} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {slot.slots[0]}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <ApperIcon name="Users" size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{slot.className}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(slot.subject)}`}>
                        {slot.subject}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="X"
                      onClick={() => removeSlot(slot.Id)}
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                    />
                  </div>
                </motion.div>
              ))}

              {getScheduleForDay(day).length === 0 && (
                <div className="text-center py-8">
                  <ApperIcon name="Calendar" size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No classes scheduled</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ScheduleSetup