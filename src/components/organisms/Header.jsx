import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Header = ({ onMenuToggle, title = "Dashboard" }) => {
return (
    <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              icon="Menu"
              onClick={onMenuToggle}
              className="lg:hidden p-2 touch-manipulation"
            />
            
            <div className="lg:hidden flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <ApperIcon name="GraduationCap" size={16} className="text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold text-gradient truncate">Checkgu</span>
            </div>
<div className="hidden lg:block min-w-0 flex-1">
              <h1 className="dynamic-title-text font-bold text-gray-900 truncate">{title}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="hidden sm:flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <ApperIcon name="Clock" size={14} className="sm:size-4" />
              <span className="hidden md:inline">{new Date().toLocaleDateString()}</span>
              <span className="md:hidden">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-primary rounded-full flex items-center justify-center cursor-pointer touch-manipulation"
            >
              <ApperIcon name="User" size={16} className="text-white sm:size-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header