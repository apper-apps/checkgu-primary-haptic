import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const FileUploadZone = ({ onFileSelect, acceptedTypes = '.docx', maxSize = 10 * 1024 * 1024 }) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }

  const validateAndSelectFile = (file) => {
    setError('')
    
    // Check file type
    if (!file.name.endsWith('.docx')) {
      setError('Please select a .docx file')
      return
    }
    
    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`)
      return
    }
    
    onFileSelect(file)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${error ? 'border-error-300 bg-error-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mx-auto
            ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}
            ${error ? 'bg-error-100' : ''}
          `}>
            <ApperIcon 
              name={error ? 'AlertCircle' : 'Upload'} 
              size={32} 
              className={`
                ${isDragActive ? 'text-primary-600' : 'text-gray-400'}
                ${error ? 'text-error-600' : ''}
              `}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload lesson plan template'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your .docx file here, or click to browse
            </p>
            
            <Button
              onClick={openFileDialog}
              variant="primary"
              icon="FileText"
              className="mb-4"
            >
              Select File
            </Button>
            
            <p className="text-sm text-gray-500">
              Supports .docx files up to {maxSize / 1024 / 1024}MB
            </p>
          </div>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg"
            >
              <p className="text-sm text-error-600 flex items-center space-x-2">
                <ApperIcon name="AlertCircle" size={14} />
                <span>{error}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default FileUploadZone