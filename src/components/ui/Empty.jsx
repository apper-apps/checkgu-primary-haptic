import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Empty = ({ 
  title = "No data available", 
  description = "Get started by adding some content.",
  actionText = "Get Started",
  onAction,
  icon = "FolderOpen",
  type = 'default'
}) => {
  const getEmptyContent = () => {
    switch (type) {
      case 'upload':
        return {
          title: "No lesson plans uploaded yet",
          description: "Upload your first .docx lesson plan template to get started with automated planning.",
          actionText: "Upload Template",
          icon: "Upload"
        }
      case 'files':
        return {
          title: "No recent files",
          description: "Your processed lesson plans will appear here once you start uploading templates.",
          actionText: "Upload Your First File",
          icon: "FileText"
        }
      case 'calendar':
        return {
          title: "Calendar not configured",
          description: "Set up your academic year, holidays, and breaks to enable automatic date replacement.",
          actionText: "Configure Calendar",
          icon: "Calendar"
        }
      case 'schedule':
        return {
          title: "No schedule set up",
          description: "Create your weekly timetable to automatically populate class and subject information.",
          actionText: "Create Schedule",
          icon: "Clock"
        }
      default:
        return { title, description, actionText, icon }
    }
  }

  const content = getEmptyContent()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-lg border border-gray-200 p-12 shadow-card text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ApperIcon name={content.icon} size={40} className="text-primary-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {content.title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
        {content.description}
      </p>
      
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-medium shadow-premium hover:shadow-hover transition-all duration-200 inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>{content.actionText}</span>
        </motion.button>
      )}
    </motion.div>
  )
}

export default Empty