import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Input from '@/components/atoms/Input'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import SearchBar from '@/components/molecules/SearchBar'
import GoogleDriveModal from '@/components/organisms/GoogleDriveModal'
import { lessonPlanService } from '@/services/api/lessonPlanService'
import { googleDriveService } from '@/services/api/googleDriveService'
import { userSettingsService } from '@/services/api/userSettingsService'

const LessonPlansPage = () => {
  const [lessonPlans, setLessonPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [sortBy, setSortBy] = useState('subject')
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'list'
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false)
  const [currentExportFile, setCurrentExportFile] = useState(null)
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false)
  const [exportingFiles, setExportingFiles] = useState(new Set())

  useEffect(() => {
    loadLessonPlans()
    checkGoogleDriveStatus()
  }, [])

  const loadLessonPlans = async () => {
    setLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const data = await lessonPlanService.getAll()
      setLessonPlans(data)
    } catch (err) {
      setError('Failed to load lesson plans')
      console.error('Error loading lesson plans:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkGoogleDriveStatus = async () => {
    try {
      const settings = await userSettingsService.getAll()
      if (settings.length > 0) {
        setGoogleDriveConnected(settings[0].googleDriveConnected || false)
      }
    } catch (err) {
      console.error('Error checking Google Drive status:', err)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleDownload = async (lessonPlan) => {
    if (lessonPlan.status !== 'completed') {
      toast.error('Lesson plan is not ready for download')
      return
    }

    try {
      const fileBlob = await lessonPlanService.downloadFile(lessonPlan.Id)
      
      if (!fileBlob || !(fileBlob instanceof Blob)) {
        throw new Error('Invalid file data received from service')
      }
      
      if (fileBlob.size === 0) {
        throw new Error('Downloaded file is empty')
      }
      
      const fileName = lessonPlan.fileName || 'lesson-plan'
      const finalFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`
      
      const downloadUrl = window.URL.createObjectURL(fileBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = finalFileName
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      toast.success(`Downloaded ${finalFileName}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Failed to download ${lessonPlan.fileName || 'lesson plan'}`)
    }
  }

  const handleDelete = async (lessonPlanId) => {
    if (window.confirm('Are you sure you want to delete this lesson plan?')) {
      try {
        await lessonPlanService.delete(lessonPlanId)
        setLessonPlans(lessonPlans.filter(plan => plan.Id !== lessonPlanId))
        toast.success('Lesson plan deleted successfully')
      } catch (err) {
        toast.error('Failed to delete lesson plan')
        console.error('Error deleting lesson plan:', err)
      }
    }
  }

  const handleExportToGoogleDrive = async (lessonPlan) => {
    if (!googleDriveConnected) {
      setCurrentExportFile(lessonPlan)
      setShowGoogleDriveModal(true)
      return
    }

    setExportingFiles(prev => new Set([...prev, lessonPlan.Id]))

    try {
      const result = await googleDriveService.exportFile(lessonPlan)
      
      if (result.success) {
        await lessonPlanService.update(lessonPlan.Id, {
          googleDriveExported: true,
          googleDriveUrl: result.driveUrl,
          exportedAt: new Date().toISOString()
        })

        setLessonPlans(lessonPlans.map(plan => 
          plan.Id === lessonPlan.Id 
            ? { ...plan, googleDriveExported: true, googleDriveUrl: result.driveUrl }
            : plan
        ))

        toast.success('Lesson plan exported to Google Drive successfully!')
      }
    } catch (err) {
      if (err.message === 'Google Drive not connected') {
        setCurrentExportFile(lessonPlan)
        setShowGoogleDriveModal(true)
      } else {
        toast.error('Failed to export lesson plan to Google Drive')
        console.error('Export error:', err)
      }
    } finally {
      setExportingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(lessonPlan.Id)
        return newSet
      })
    }
  }

  const handleGoogleDriveConnect = async () => {
    setShowGoogleDriveModal(false)
    await checkGoogleDriveStatus()
    
    if (currentExportFile) {
      setTimeout(() => {
        handleExportToGoogleDrive(currentExportFile)
        setCurrentExportFile(null)
      }, 500)
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'processing'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle'
      case 'processing':
        return 'Clock'
      case 'error':
        return 'AlertCircle'
      default:
        return 'BookOpen'
    }
  }

  // Filter and sort lesson plans
  const filteredPlans = lessonPlans.filter(plan => {
    const matchesSearch = plan.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.grade?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = !filterSubject || plan.subject === filterSubject
    const matchesGrade = !filterGrade || plan.grade === filterGrade
    const matchesDate = !filterDate || format(new Date(plan.uploadDate), 'yyyy-MM-dd') === filterDate

    return matchesSearch && matchesSubject && matchesGrade && matchesDate
  })

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case 'subject':
        return (a.subject || '').localeCompare(b.subject || '')
      case 'grade':
        return (a.grade || '').localeCompare(b.grade || '')
      case 'date':
        return new Date(b.uploadDate) - new Date(a.uploadDate)
      case 'name':
        return a.fileName.localeCompare(b.fileName)
      default:
        return 0
    }
  })

  // Group lesson plans by subject
  const groupedPlans = sortedPlans.reduce((groups, plan) => {
    const subject = plan.subject || 'Other'
    if (!groups[subject]) {
      groups[subject] = []
    }
    groups[subject].push(plan)
    return groups
  }, {})

  // Get unique values for filters
  const subjects = [...new Set(lessonPlans.map(plan => plan.subject).filter(Boolean))]
  const grades = [...new Set(lessonPlans.map(plan => plan.grade).filter(Boolean))]

  if (loading) {
    return <Loading type="lesson-plans" />
  }

  if (error) {
    return <Error message={error} onRetry={loadLessonPlans} type="lesson-plans" />
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lesson Plans</h1>
        <p className="text-lg text-gray-600">
          Organize and manage your lesson plans by subject, grade, and date
        </p>
      </motion.div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search lesson plans..."
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grouped' ? 'primary' : 'ghost'}
                size="sm"
                icon="Grid3x3"
                onClick={() => setViewMode('grouped')}
              >
                Grouped
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                icon="List"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="subject">Subject</option>
                <option value="grade">Grade</option>
                <option value="date">Date</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filterSubject || filterGrade || filterDate || searchTerm) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredPlans.length} of {lessonPlans.length} lesson plans
                </span>
                {filterSubject && (
                  <Badge variant="secondary">
                    Subject: {filterSubject}
                    <button
                      onClick={() => setFilterSubject('')}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filterGrade && (
                  <Badge variant="secondary">
                    Grade: {filterGrade}
                    <button
                      onClick={() => setFilterGrade('')}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filterDate && (
                  <Badge variant="secondary">
                    Date: {format(new Date(filterDate), 'MMM d, yyyy')}
                    <button
                      onClick={() => setFilterDate('')}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterSubject('')
                  setFilterGrade('')
                  setFilterDate('')
                  setSearchTerm('')
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      {sortedPlans.length === 0 ? (
        <Empty type="lesson-plans" />
      ) : (
        <div className="space-y-6">
          {viewMode === 'grouped' ? (
            // Grouped View
            Object.entries(groupedPlans).map(([subject, plans]) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  <h2 className="text-xl font-semibold text-gray-900">{subject}</h2>
                  <Badge variant="secondary">{plans.length} plan{plans.length !== 1 ? 's' : ''}</Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {plans.map((plan, index) => (
                    <LessonPlanCard
                      key={plan.Id}
                      plan={plan}
                      index={index}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onExportToGoogleDrive={handleExportToGoogleDrive}
                      exportingFiles={exportingFiles}
                      getStatusVariant={getStatusVariant}
                      getStatusIcon={getStatusIcon}
                    />
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            // List View
            <div className="space-y-4">
              {sortedPlans.map((plan, index) => (
                <LessonPlanCard
                  key={plan.Id}
                  plan={plan}
                  index={index}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onExportToGoogleDrive={handleExportToGoogleDrive}
                  exportingFiles={exportingFiles}
                  getStatusVariant={getStatusVariant}
                  getStatusIcon={getStatusIcon}
                  listView={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <GoogleDriveModal
        isOpen={showGoogleDriveModal}
        onClose={() => {
          setShowGoogleDriveModal(false)
          setCurrentExportFile(null)
        }}
        onConnect={handleGoogleDriveConnect}
      />
    </div>
  )
}

// Lesson Plan Card Component
const LessonPlanCard = ({ 
  plan, 
  index, 
  onDownload, 
  onDelete, 
  onExportToGoogleDrive, 
  exportingFiles, 
  getStatusVariant, 
  getStatusIcon, 
  listView = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={listView ? 'w-full' : ''}
    >
      <Card className="p-6 h-full" hover>
        <div className={`${listView ? 'flex items-center justify-between' : 'space-y-4'}`}>
          <div className={`${listView ? 'flex items-center space-x-4 flex-1' : 'space-y-3'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ApperIcon name="BookOpen" size={24} className="text-primary-600" />
            </div>
            
            <div className={`${listView ? 'flex-1' : ''}`}>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{plan.fileName}</h3>
                <Badge 
                  variant={getStatusVariant(plan.status)}
                  icon={getStatusIcon(plan.status)}
                >
                  {plan.status}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <ApperIcon name="BookOpen" size={14} />
                    <span>{plan.subject || 'N/A'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ApperIcon name="GraduationCap" size={14} />
                    <span>{plan.grade || 'N/A'}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Uploaded {format(new Date(plan.uploadDate), 'MMM d, yyyy at h:mm a')}
                </p>
              </div>

              {plan.topics && plan.topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {plan.topics.slice(0, 3).map((topic, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                    >
                      {topic}
                    </span>
                  ))}
                  {plan.topics.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      +{plan.topics.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 ${listView ? 'flex-shrink-0' : ''}`}>
            {plan.status === 'completed' && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  icon="Download"
                  onClick={() => onDownload(plan)}
                >
                  Download
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  icon="HardDrive"
                  onClick={() => onExportToGoogleDrive(plan)}
                  loading={exportingFiles.has(plan.Id)}
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  {plan.googleDriveExported ? 'Exported' : 'Export'}
                </Button>
              </>
            )}
            
            {plan.status === 'processing' && (
              <Button
                variant="secondary"
                size="sm"
                icon="Clock"
                disabled
              >
                Processing
              </Button>
            )}
            
            {plan.status === 'error' && (
              <Button
                variant="danger"
                size="sm"
                icon="RefreshCw"
                onClick={() => toast.info('Retry functionality coming soon')}
              >
                Retry
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              icon="Trash2"
              onClick={() => onDelete(plan.Id)}
              className="text-error-600 hover:text-error-700 hover:bg-error-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default LessonPlansPage