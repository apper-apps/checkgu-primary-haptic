import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
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
  const [placeholderFields, setPlaceholderFields] = useState([
    {
      id: 'date',
      key: '{{date}}',
      description: 'Current date or scheduled date',
      icon: 'Calendar',
      iconColor: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      id: 'title',
      key: '{{title}}',
      description: 'Lesson title or subject name',
      icon: 'Type',
      iconColor: 'text-secondary-600',
      bgColor: 'bg-secondary-100'
    },
    {
      id: 'class',
      key: '{{class}}',
      description: 'Class name or grade level',
      icon: 'Users',
      iconColor: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      id: 'duration',
      key: '{{duration}}',
      description: 'Lesson duration from schedule',
      icon: 'Clock',
      iconColor: 'text-warning-600',
      bgColor: 'bg-warning-100'
    }
  ])

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
  }

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(placeholderFields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPlaceholderFields(items)
    toast.success('Field order updated')
  }

  const cancelProcessing = () => {
    setCurrentFile(null)
    setProcessingStatus('idle')
    setProgress(0)
    toast.info('Processing cancelled')

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Template Fields</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ApperIcon name="Move" size={14} />
                <span>Drag to reorder</span>
              </div>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="placeholder-fields">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-2' : ''
                    }`}
                  >
                    {placeholderFields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200
                              ${snapshot.isDragging 
                                ? 'bg-white shadow-lg border-primary-300 scale-105' 
                                : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-sm'
                              }
                            `}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <ApperIcon name="GripVertical" size={16} className="text-gray-400" />
                            </div>
                            
                            <div className={`w-8 h-8 ${field.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <ApperIcon name={field.icon} size={16} className={field.iconColor} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <code className="text-sm bg-white px-2 py-1 rounded border font-mono">{field.key}</code>
                              <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                            </div>
                            
                            <div className="flex items-center space-x-1 text-gray-400">
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <ApperIcon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Field Order</p>
                  <p>Drag fields to set the processing priority in your lesson plan template.</p>
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