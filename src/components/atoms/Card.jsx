import { motion } from 'framer-motion'

const Card = ({ children, className = '', hover = false, ...props }) => {
  const Component = hover ? motion.div : 'div'
  
  const motionProps = hover ? {
    whileHover: { y: -2, scale: 1.02 },
    transition: { duration: 0.2 }
  } : {}

return (
    <Component
      className={`
        bg-gradient-card rounded-md sm:rounded-lg border border-gray-200 shadow-card
        transition-all duration-200
        ${hover ? 'hover:shadow-hover hover:border-gray-300 cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Card