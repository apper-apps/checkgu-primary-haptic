import { motion } from 'framer-motion'
import CalendarSetup from '@/components/organisms/CalendarSetup'

const CalendarPage = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Calendar</h1>
        <p className="text-lg text-gray-600">
          Configure your academic year, holidays, and breaks for automatic date replacement
        </p>
      </motion.div>

      <CalendarSetup />
    </div>
  )
}

export default CalendarPage