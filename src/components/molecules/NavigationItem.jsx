import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const NavigationItem = ({ to, icon, label, badge = null, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
className={({ isActive }) => `
        flex items-center space-x-2 sm:space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-md sm:rounded-lg 
        text-sm font-medium transition-all duration-200 touch-manipulation
        ${isActive 
          ? 'bg-gradient-primary text-white shadow-lg transform scale-[0.98] sm:scale-100' 
          : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50 active:scale-[0.96]'
        }
      `}
    >
      {({ isActive }) => (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-3 w-full"
        >
          <ApperIcon 
            name={icon} 
            size={20} 
            className={isActive ? 'text-white' : 'text-gray-500'}
          />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className={`
              px-2 py-1 text-xs rounded-full
              ${isActive ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'}
            `}>
              {badge}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  )
}

export default NavigationItem