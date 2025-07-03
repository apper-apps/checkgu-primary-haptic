import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const NavigationItem = ({ to, icon, label, badge = null, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-gradient-primary text-white shadow-lg' 
          : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
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