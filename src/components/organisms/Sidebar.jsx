import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import NavigationItem from '@/components/molecules/NavigationItem'

const Sidebar = ({ isOpen, onClose }) => {
const navigationItems = [
    { to: '/', icon: 'Home', label: 'Home' },
    { to: '/upload', icon: 'Upload', label: 'Upload' },
    { to: '/calendar', icon: 'Calendar', label: 'Calendar' },
{ to: '/schedule', icon: 'Clock', label: 'Schedule' },
    { to: '/recent', icon: 'FileText', label: 'Recent Files' },
    { to: '/lesson-plans', icon: 'BookOpen', label: 'Lesson Plans' },
    { to: '/settings', icon: 'Settings', label: 'Settings' }
  ]
return (
    <>
{/* Desktop Sidebar */}
      <div className="hidden lg:block dynamic-sidebar-width bg-white border-r border-gray-200 shadow-sm flex-shrink-0 transition-all duration-300">
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 lg:px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <ApperIcon name="GraduationCap" size={24} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gradient truncate">Checkgu</h1>
                <p className="text-sm text-gray-500 truncate">Lesson Planning</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 lg:px-6 space-y-1 overflow-y-auto">
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
          
          <div className="px-4 py-4 lg:px-6 lg:py-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <ApperIcon name="User" size={16} className="flex-shrink-0" />
              <span className="truncate">Teacher Dashboard</span>
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
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative dynamic-mobile-sidebar-width max-w-[85vw] bg-white shadow-2xl"
            >
              <div className="h-full flex flex-col">
                <div className="px-4 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <ApperIcon name="GraduationCap" size={24} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gradient truncate">Checkgu</h1>
                        <p className="text-sm text-gray-500 truncate">Lesson Planning</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-3 -mr-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overscroll-contain">
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
                
                <div className="px-4 py-6 border-t border-gray-200 flex-shrink-0">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <ApperIcon name="User" size={16} className="flex-shrink-0" />
                    <span className="truncate">Teacher Dashboard</span>
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