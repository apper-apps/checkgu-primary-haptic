import { motion } from 'framer-motion'
import ScheduleSetup from '@/components/organisms/ScheduleSetup'

const SchedulePage = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
        <p className="text-lg text-gray-600">
          Set up your weekly timetable for automatic class and subject information
        </p>
      </motion.div>

      <ScheduleSetup />
    </div>
  )
}

export default SchedulePage