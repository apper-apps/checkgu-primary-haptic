import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import SubjectModal from '@/components/molecules/SubjectModal'
import { weeklyScheduleService } from '@/services/api/weeklyScheduleService'

const HomePage = () => {
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  const colors = {
    Mathematics: 'bg-blue-100 text-blue-800 border-blue-200',
    Science: 'bg-green-100 text-green-800 border-green-200',
    English: 'bg-purple-100 text-purple-800 border-purple-200',
    History: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Geography: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Art: 'bg-pink-100 text-pink-800 border-pink-200',
    Music: 'bg-red-100 text-red-800 border-red-200',
    'Physical Education': 'bg-orange-100 text-orange-800 border-orange-200',
    'Malay Language': 'bg-teal-100 text-teal-800 border-teal-200',
    'Computer Science': 'bg-cyan-100 text-cyan-800 border-cyan-200'
  }

  const loadSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await weeklyScheduleService.getAll()
      setScheduleData(data)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  const getSubjectColor = (subject) => {
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getScheduleForDay = (day) => {
    return scheduleData.filter(item => item.dayOfWeek === day)
  }

  const findSubjectAtTime = (day, time) => {
    const daySchedule = getScheduleForDay(day)
    return daySchedule.find(item => {
      const [startTime] = item.slots[0].split(' - ')
      return startTime === time
    })
  }

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleCreateSubject = () => {
    setSelectedSubject(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleSaveSubject = async (subjectData) => {
    try {
      if (modalMode === 'create') {
        await weeklyScheduleService.create(subjectData)
        toast.success('Subject created successfully')
      } else {
        await weeklyScheduleService.update(selectedSubject.Id, subjectData)
        toast.success('Subject updated successfully')
      }
      await loadSchedule()
      setModalOpen(false)
      setSelectedSubject(null)
    } catch (err) {
      toast.error(`Failed to ${modalMode} subject`)
    }
  }

  const handleDeleteSubject = async (subjectId) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await weeklyScheduleService.delete(subjectId)
        toast.success('Subject deleted successfully')
        await loadSchedule()
        setModalOpen(false)
        setSelectedSubject(null)
      } catch (err) {
        toast.error('Failed to delete subject')
      }
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadSchedule} />

  return (
    <div className="dynamic-spacing-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="dynamic-title-text font-bold text-gray-900">Weekly Timetable</h1>
          <p className="text-gray-600 mt-1">Click on any subject to view details or create new ones</p>
        </div>
        <Button
          onClick={handleCreateSubject}
          className="bg-gradient-primary text-white hover:opacity-90 flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          Add Subject
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-6 gap-px bg-gray-200">
              <div className="bg-gray-50 p-3 font-medium text-gray-900 text-center">
                Time
              </div>
              {daysOfWeek.map(day => (
                <div key={day} className="bg-gray-50 p-3 font-medium text-gray-900 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="bg-white">
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-6 gap-px bg-gray-200 min-h-[60px]">
                  <div className="bg-white p-3 flex items-center justify-center text-sm font-medium text-gray-600">
                    {time}
                  </div>
                  {daysOfWeek.map(day => {
                    const subject = findSubjectAtTime(day, time)
                    return (
                      <div key={`${day}-${time}`} className="bg-white p-2 flex items-center justify-center">
                        {subject ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSubjectClick(subject)}
                            className={`w-full h-full min-h-[44px] rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md ${getSubjectColor(subject.subject)}`}
                          >
                            <div className="truncate">{subject.subject}</div>
                            <div className="text-xs opacity-75 mt-1">
                              {subject.duration}min
                            </div>
                          </motion.button>
                        ) : (
                          <button
                            onClick={handleCreateSubject}
                            className="w-full h-full min-h-[44px] rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center text-gray-400 hover:text-primary-600"
                          >
                            <ApperIcon name="Plus" size={20} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Subject Modal */}
      {modalOpen && (
        <SubjectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveSubject}
          onDelete={modalMode === 'edit' ? () => handleDeleteSubject(selectedSubject.Id) : null}
          subject={selectedSubject}
          mode={modalMode}
        />
      )}
    </div>
  )
}

export default HomePage