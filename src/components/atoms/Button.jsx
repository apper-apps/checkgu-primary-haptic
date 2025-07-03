import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    primary: "bg-gradient-primary text-white shadow-lg hover:shadow-xl focus:ring-primary-500 disabled:opacity-50",
    secondary: "bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 focus:ring-primary-500 disabled:opacity-50",
    success: "bg-gradient-success text-white shadow-lg hover:shadow-xl focus:ring-success-500 disabled:opacity-50",
    danger: "bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg hover:shadow-xl focus:ring-error-500 disabled:opacity-50",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-primary-500 disabled:opacity-50"
  }
  
const sizes = {
    sm: "px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm",
    md: "px-3 py-1.5 text-sm sm:px-4 sm:py-2",
    lg: "px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base",
    xl: "px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg"
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      )}
      {icon && !loading && (
        <ApperIcon name={icon} size={16} className="mr-2" />
      )}
      {children}
    </motion.button>
  )
}

export default Button