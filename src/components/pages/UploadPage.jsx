import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import FileUploadZone from '@/components/molecules/FileUploadZone'
import ProcessingStatus from '@/components/molecules/ProcessingStatus'
import FileList from '@/components/organisms/FileList'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { lessonPlanService } from '@/services/api/lessonPlanService'

const UploadPage = () => {
  const [currentFile, setCurrentFile] = useState(null)
  const [processingStatus, setProcessingStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFileSelect = async (file) => {
    setCurrentFile(file)
    setProcessingStatus('uploading')
    setProgress(0)

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval)
            processFile(file)
            return 100
          }
          return prev + 10
        })
      }, 200)

    } catch (err) {
      setProcessingStatus('error')
      toast.error('Failed to upload file')
      console.error('Upload error:', err)
    }
  }

  const processFile = async (file) => {
    setProcessingStatus('processing')
    setProgress(0)

    try {
      // Simulate processing
      const processingInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(processingInterval)
            completeProcessing(file)
            return 100
          }
          return prev + 8
        })
      }, 300)

    } catch (err) {
      setProcessingStatus('error')
      toast.error('Failed to process file')
      console.error('Processing error:', err)
    }
  }

  const completeProcessing = async (file) => {
    try {
      // Create lesson plan record
      const lessonPlanData = {
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        status: 'completed',
        processedUrl: '/downloads/processed-' + file.name,
        placeholders: {
          '{{title}}': 'Mathematics Lesson',
          '{{date}}': new Date().toLocaleDateString(),
          '{{duration}}': '45 minutes',
          '{{class}}': 'Grade 5A'
        }
      }

      await lessonPlanService.create(lessonPlanData)
      
      setProcessingStatus('completed')
      setProgress(100)
      toast.success('Lesson plan processed successfully!')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setCurrentFile(null)
        setProcessingStatus('idle')
        setProgress(0)
        setRefreshKey(prev => prev + 1)
      }, 3000)

    } catch (err) {
      setProcessingStatus('error')
      toast.error('Failed to save processed file')
      console.error('Save error:', err)
    }
  }

  const cancelProcessing = () => {
    setCurrentFile(null)
    setProcessingStatus('idle')
    setProgress(0)
    toast.info('Processing cancelled')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Upload Lesson Plan Template
        </motion.h1>
        <p className="text-lg text-gray-600">
          Upload your .docx template and let Checkgu automatically replace placeholders with your calendar and schedule data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Template</h2>
            
            {currentFile && (processingStatus === 'uploading' || processingStatus === 'processing') ? (
              <ProcessingStatus
                status={processingStatus}
                fileName={currentFile.name}
                progress={progress}
                onCancel={cancelProcessing}
              />
            ) : (
              <FileUploadZone onFileSelect={handleFileSelect} />
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Supported Placeholders</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="Calendar" size={16} className="text-primary-600" />
                </div>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{'{{date}}'}</code>
                  <p className="text-sm text-gray-600">Current date or scheduled date</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="Type" size={16} className="text-secondary-600" />
                </div>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{'{{title}}'}</code>
                  <p className="text-sm text-gray-600">Lesson title or subject name</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="Users" size={16} className="text-success-600" />
                </div>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{'{{class}}'}</code>
                  <p className="text-sm text-gray-600">Class name or grade level</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="Clock" size={16} className="text-warning-600" />
                </div>
                <div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{'{{duration}}'}</code>
                  <p className="text-sm text-gray-600">Lesson duration from schedule</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Uploads</h2>
              <Button
                variant="ghost"
                size="sm"
                icon="RefreshCw"
                onClick={() => setRefreshKey(prev => prev + 1)}
              >
                Refresh
              </Button>
            </div>
            <FileList key={refreshKey} limit={5} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UploadPage