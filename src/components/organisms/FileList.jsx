import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import { lessonPlanService } from '@/services/api/lessonPlanService'

const FileList = ({ searchTerm = '', limit = null }) => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadFiles = async () => {
    setLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const data = await lessonPlanService.getAll()
      setFiles(data)
    } catch (err) {
      setError('Failed to load files')
      console.error('Error loading files:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayFiles = limit ? filteredFiles.slice(0, limit) : filteredFiles

  const handleDownload = (file) => {
    if (file.status === 'completed' && file.processedUrl) {
      // Simulate download
      toast.success(`Downloading ${file.fileName}`)
    } else {
      toast.error('File is not ready for download')
    }
  }

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await lessonPlanService.delete(fileId)
        setFiles(files.filter(file => file.Id !== fileId))
        toast.success('File deleted successfully')
      } catch (err) {
        toast.error('Failed to delete file')
        console.error('Error deleting file:', err)
      }
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
        return 'FileText'
    }
  }

  if (loading) {
    return <Loading type="files" />
  }

  if (error) {
    return <Error message={error} onRetry={loadFiles} type="file" />
  }

  if (displayFiles.length === 0) {
    return <Empty type="files" />
  }

  return (
    <div className="space-y-4">
      {displayFiles.map((file, index) => (
        <motion.div
          key={file.Id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6" hover>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="FileText" size={24} className="text-primary-600" />
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{file.fileName}</h3>
                    <Badge 
                      variant={getStatusVariant(file.status)}
                      icon={getStatusIcon(file.status)}
                    >
                      {file.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Uploaded {format(new Date(file.uploadDate), 'MMM d, yyyy at h:mm a')}
                  </p>
                  
                  {file.placeholders && Object.keys(file.placeholders).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.keys(file.placeholders).slice(0, 3).map((placeholder) => (
                        <span 
                          key={placeholder}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          {placeholder}
                        </span>
                      ))}
                      {Object.keys(file.placeholders).length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          +{Object.keys(file.placeholders).length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {file.status === 'completed' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon="Download"
                    onClick={() => handleDownload(file)}
                  >
                    Download
                  </Button>
                )}
                
                {file.status === 'processing' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="Clock"
                    disabled
                  >
                    Processing
                  </Button>
                )}
                
                {file.status === 'error' && (
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
                  onClick={() => handleDelete(file.Id)}
                  className="text-error-600 hover:text-error-700 hover:bg-error-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default FileList