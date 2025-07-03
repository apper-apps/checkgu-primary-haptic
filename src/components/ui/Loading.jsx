import { motion } from 'framer-motion'

const Loading = ({ type = 'page' }) => {
  if (type === 'upload') {
    return (
      <div className="bg-gradient-card rounded-lg border border-gray-200 p-8 shadow-card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-full w-48 mx-auto mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-full w-32 mx-auto animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (type === 'files') {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-card rounded-lg border border-gray-200 p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === 'calendar') {
    return (
      <div className="bg-gradient-card rounded-lg border border-gray-200 p-6 shadow-card">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'schedule') {
    return (
      <div className="bg-gradient-card rounded-lg border border-gray-200 p-6 shadow-card">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="grid grid-cols-6 gap-4">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default page loading
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"
      />
      <div className="text-center">
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
      </div>
    </div>
  )
}

export default Loading