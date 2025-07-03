import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const ProcessingStatus = ({ status, fileName, progress = 0, onCancel }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: 'Upload',
          title: 'Uploading...',
          description: 'Uploading your lesson plan template',
          color: 'primary',
          showProgress: true
        }
      case 'processing':
        return {
          icon: 'Cog',
          title: 'Processing...',
          description: 'Analyzing placeholders and replacing with your data',
          color: 'processing',
          showProgress: true
        }
      case 'completed':
        return {
          icon: 'CheckCircle',
          title: 'Completed!',
          description: 'Your lesson plan is ready for download',
          color: 'success',
          showProgress: false
        }
      case 'error':
        return {
          icon: 'AlertCircle',
          title: 'Error',
          description: 'Something went wrong while processing your file',
          color: 'error',
          showProgress: false
        }
      default:
        return {
          icon: 'FileText',
          title: 'Ready',
          description: 'Ready to process',
          color: 'default',
          showProgress: false
        }
    }
  }

  const config = getStatusConfig()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-lg border border-gray-200 p-6 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${config.color === 'primary' ? 'bg-primary-100' : ''}
            ${config.color === 'processing' ? 'bg-gradient-to-r from-primary-100 to-secondary-100' : ''}
            ${config.color === 'success' ? 'bg-success-100' : ''}
            ${config.color === 'error' ? 'bg-error-100' : ''}
            ${config.color === 'default' ? 'bg-gray-100' : ''}
          `}>
            {status === 'processing' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ApperIcon name={config.icon} size={24} className="text-primary-600" />
              </motion.div>
            ) : (
              <ApperIcon 
                name={config.icon} 
                size={24} 
                className={`
                  ${config.color === 'primary' ? 'text-primary-600' : ''}
                  ${config.color === 'processing' ? 'text-primary-600' : ''}
                  ${config.color === 'success' ? 'text-success-600' : ''}
                  ${config.color === 'error' ? 'text-error-600' : ''}
                  ${config.color === 'default' ? 'text-gray-600' : ''}
                `}
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
              <Badge variant={config.color} size="sm">
                {status}
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-1">{config.description}</p>
            
            <p className="text-sm text-gray-500 font-medium">{fileName}</p>
            
            {config.showProgress && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {onCancel && (status === 'uploading' || status === 'processing') && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <ApperIcon name="X" size={20} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default ProcessingStatus