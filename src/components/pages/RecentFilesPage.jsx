import { useState } from 'react'
import { motion } from 'framer-motion'
import FileList from '@/components/organisms/FileList'
import SearchBar from '@/components/molecules/SearchBar'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const RecentFilesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recent Files</h1>
        <p className="text-lg text-gray-600">
          View and manage your processed lesson plans
        </p>
      </motion.div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search files..."
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon="RefreshCw"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon="Filter"
            >
              Filter
            </Button>
          </div>
        </div>

        <FileList key={refreshKey} searchTerm={searchTerm} />
      </Card>
    </div>
  )
}

export default RecentFilesPage