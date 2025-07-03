import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Error = ({ message = "Something went wrong", onRetry, type = 'general' }) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'upload':
        return 'Upload'
      case 'network':
        return 'Wifi'
      case 'file':
        return 'FileX'
      default:
        return 'AlertCircle'
    }
  }

  const getErrorTitle = () => {
    switch (type) {
      case 'upload':
        return 'Upload Failed'
      case 'network':
        return 'Connection Error'
      case 'file':
        return 'File Error'
      default:
        return 'Error'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-lg border border-error-200 p-8 shadow-card text-center"
    >
      <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ApperIcon name={getErrorIcon()} size={32} className="text-error-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {getErrorTitle()}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center space-x-2"
        >
          <ApperIcon name="RefreshCw" size={16} />
          <span>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  )
}

export default Error