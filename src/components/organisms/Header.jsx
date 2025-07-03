import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Header = ({ onMenuToggle, title = "Dashboard" }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon="Menu"
              onClick={onMenuToggle}
              className="lg:hidden"
            />
            
            <div className="lg:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">Checkgu</span>
            </div>
            
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <ApperIcon name="Clock" size={16} />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center cursor-pointer"
            >
              <ApperIcon name="User" size={16} className="text-white" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header