import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { teachingScheduleService } from "@/services/api/teachingScheduleService";
import { classService } from "@/services/api/classService";
import { subjectService } from "@/services/api/subjectService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

const ScheduleSetup = () => {
  const [schedule, setSchedule] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showLevelForm, setShowLevelForm] = useState(false)
  const [expandedLevels, setExpandedLevels] = useState({})
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    classId: '',
    subjectId: '',
    room: ''
  })
  const [newLevel, setNewLevel] = useState({
    name: '',
    description: '',
    classCount: 1,
    assignedSubjects: []
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  const groupClassesByLevel = () => {
    const grouped = {}
    classes.forEach(cls => {
      const level = cls.level || 'Unassigned'
      if (!grouped[level]) {
        grouped[level] = []
      }
      grouped[level].push(cls)
    })
    return grouped
  }

  const getSubjectsForLevel = (levelName) => {
    const levelClasses = classes.filter(cls => cls.level === levelName)
    const subjectIds = new Set()
    
    schedule.forEach(slot => {
      const slotClass = levelClasses.find(cls => cls.Id === slot.classId)
      if (slotClass) {
        subjectIds.add(slot.subjectId)
      }
    })
    
    return subjects.filter(subject => subjectIds.has(subject.Id))
  }

  const addLevel = async () => {
    if (!newLevel.name || !newLevel.description) {
      toast.error('Please fill in level name and description')
      return
    }

    try {
      // Create classes for the level
      const classPromises = []
      for (let i = 1; i <= parseInt(newLevel.classCount); i++) {
        const className = `${newLevel.name}${String.fromCharCode(64 + i)}`
        classPromises.push(
          classService.create({
            name: className,
            description: `${newLevel.description} Class ${String.fromCharCode(64 + i)}`,
            level: newLevel.name,
            studentCount: 0,
            academic_year: new Date().getFullYear().toString()
          })
        )
      }
      
      await Promise.all(classPromises)
      toast.success(`Level ${newLevel.name} created with ${newLevel.classCount} classes`)
      setNewLevel({ name: '', description: '', classCount: 1, assignedSubjects: [] })
      setShowLevelForm(false)
      loadSchedule()
    } catch (err) {
      toast.error('Failed to create level')
      console.error('Error creating level:', err)
    }
  }

  const toggleLevel = (levelName) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelName]: !prev[levelName]
    }))
  }

  const removeLevel = async (levelName) => {
    if (window.confirm(`Are you sure you want to remove level ${levelName} and all its classes?`)) {
      try {
        const levelClasses = classes.filter(cls => cls.level === levelName)
        const deletePromises = levelClasses.map(cls => classService.delete(cls.Id))
        await Promise.all(deletePromises)
        
        toast.success(`Level ${levelName} removed successfully`)
        loadSchedule()
      } catch (err) {
        toast.error('Failed to remove level')
        console.error('Error removing level:', err)
      }
    }
  }
const loadSchedule = async () => {
    setLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const [scheduleData, classesData, subjectsData] = await Promise.all([
        teachingScheduleService.getAll(),
        classService.getAll(),
        subjectService.getAll()
      ])
      setSchedule(scheduleData)
      setClasses(classesData)
      setSubjects(subjectsData)
    } catch (err) {
      setError('Failed to load schedule data')
      console.error('Error loading schedule:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

const addSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.classId || !newSlot.subjectId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const slotData = {
        ...newSlot,
        classId: parseInt(newSlot.classId),
        subjectId: parseInt(newSlot.subjectId),
        duration: calculateDuration(newSlot.startTime, newSlot.endTime)
      }
      
      await teachingScheduleService.create(slotData)
      toast.success('Teaching schedule added successfully')
      setNewSlot({
        dayOfWeek: 'Monday',
        startTime: '',
        endTime: '',
        classId: '',
        subjectId: '',
        room: ''
      })
      loadSchedule()
    } catch (err) {
      toast.error('Failed to add teaching schedule')
      console.error('Error adding slot:', err)
    }
  }

const removeSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to remove this teaching schedule?')) {
      try {
        await teachingScheduleService.delete(slotId)
        toast.success('Teaching schedule removed successfully')
        loadSchedule()
      } catch (err) {
        toast.error('Failed to remove teaching schedule')
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
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  }

const getClassName = (classId) => {
    const cls = classes.find(c => c.Id === classId)
    return cls ? cls.name : 'Unknown Class'
  }

  const getSubjectInfo = (subjectId) => {
    const subject = subjects.find(s => s.Id === subjectId)
    return subject ? subject : { name: 'Unknown Subject', color: 'bg-gray-100 text-gray-800' }
  }

  const formatTimeSlot = (startTime, endTime) => {
    return `${startTime} - ${endTime}`
  }

  if (loading) {
    return <Loading type="schedule" />
  }

  if (error) {
    return <Error message={error} onRetry={loadSchedule} type="network" />
  }

return (
    <div className="space-y-6">
      {/* Level Management Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <ApperIcon name="Layers" size={20} />
            <span>Level Management</span>
          </h2>
          <Button
            variant="primary"
            size="sm"
            icon="Plus"
            onClick={() => setShowLevelForm(!showLevelForm)}
          >
            Add Level
          </Button>
        </div>

        {showLevelForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Level Name"
                value={newLevel.name}
                onChange={(e) => setNewLevel(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Grade 5"
              />
              <Input
                label="Description"
                value={newLevel.description}
                onChange={(e) => setNewLevel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Primary 5"
              />
              <Input
                label="Number of Classes"
                type="number"
                min="1"
                max="10"
                value={newLevel.classCount}
                onChange={(e) => setNewLevel(prev => ({ ...prev, classCount: e.target.value }))}
                placeholder="1"
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <Button variant="primary" size="sm" onClick={addLevel}>Create Level</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowLevelForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Level Overview */}
        <div className="space-y-3">
          {Object.entries(groupClassesByLevel()).map(([levelName, levelClasses]) => (
            <div key={levelName} className="border rounded-lg">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleLevel(levelName)}
              >
                <div className="flex items-center space-x-3">
                  <ApperIcon 
                    name={expandedLevels[levelName] ? "ChevronDown" : "ChevronRight"} 
                    size={16} 
                    className="text-gray-500" 
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{levelName}</h3>
                    <p className="text-sm text-gray-500">
                      {levelClasses.length} classes • {getSubjectsForLevel(levelName).length} subjects
                    </p>
                  </div>
                </div>
                {levelName !== 'Unassigned' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="X"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLevel(levelName)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  />
                )}
              </div>

              {expandedLevels[levelName] && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Classes</h4>
                      <div className="space-y-1">
                        {levelClasses.map(cls => (
                          <div key={cls.Id} className="text-sm text-gray-600 flex items-center space-x-2">
                            <ApperIcon name="Users" size={12} />
                            <span>{cls.name} ({cls.studentCount} students)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Subjects Taught</h4>
                      <div className="flex flex-wrap gap-1">
                        {getSubjectsForLevel(levelName).map(subject => (
                          <span
                            key={subject.Id}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.color}`}
                          >
                            {subject.name}
                          </span>
                        ))}
                        {getSubjectsForLevel(levelName).length === 0 && (
                          <span className="text-xs text-gray-500">No subjects assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Schedule Section */}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Teaching Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={newSlot.classId}
                onChange={(e) => setNewSlot(prev => ({ ...prev, classId: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select class</option>
                {classes.map(cls => (
                  <option key={cls.Id} value={cls.Id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={newSlot.subjectId}
                onChange={(e) => setNewSlot(prev => ({ ...prev, subjectId: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select subject</option>
                {subjects.map(subject => (
                  <option key={subject.Id} value={subject.Id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Room"
              value={newSlot.room}
              onChange={(e) => setNewSlot(prev => ({ ...prev, room: e.target.value }))}
              placeholder="Room A1"
            />
          </div>

<div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              onClick={addSlot}
              icon="Plus"
            >
              Add Teaching Schedule
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
                  className="p-3 bg-gray-50 rounded-lg flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <ApperIcon name="Clock" size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {formatTimeSlot(slot.startTime, slot.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ApperIcon name="Users" size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{getClassName(slot.classId)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ApperIcon name="MapPin" size={14} className="text-gray-500" />
                      <span className="text-xs text-gray-500">{slot.room || 'No room assigned'}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSubjectInfo(slot.subjectId).color}`}>
                      {getSubjectInfo(slot.subjectId).name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="X"
                    onClick={() => removeSlot(slot.Id)}
                    className="text-error-600 hover:text-error-700 hover:bg-error-50"
                  />
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