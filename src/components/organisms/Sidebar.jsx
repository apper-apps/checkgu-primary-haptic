import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import NavigationItem from '@/components/molecules/NavigationItem'

const Sidebar = ({ isOpen, onClose }) => {
  const navigationItems = [
    { to: '/', icon: 'Upload', label: 'Upload' },
    { to: '/calendar', icon: 'Calendar', label: 'Calendar' },
    { to: '/schedule', icon: 'Clock', label: 'Schedule' },
    { to: '/recent', icon: 'FileText', label: 'Recent Files' },
    { to: '/settings', icon: 'Settings', label: 'Settings' }
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Checkgu</h1>
                <p className="text-sm text-gray-500">Lesson Planning</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-6 space-y-2">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
              />
            ))}
          </nav>
          
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <ApperIcon name="User" size={16} />
              <span>Teacher Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className="lg:hidden">
        {isOpen && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-50"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="relative w-64 bg-white shadow-xl"
            >
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <ApperIcon name="GraduationCap" size={24} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gradient">Checkgu</h1>
                        <p className="text-sm text-gray-500">Lesson Planning</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                </div>
                
                <nav className="flex-1 p-6 space-y-2">
                  {navigationItems.map((item) => (
                    <NavigationItem
                      key={item.to}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      onClick={onClose}
                    />
                  ))}
                </nav>
                
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <ApperIcon name="User" size={16} />
                    <span>Teacher Dashboard</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar