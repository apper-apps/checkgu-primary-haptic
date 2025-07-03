import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'
import { userSettingsService } from '@/services/api/userSettingsService'

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    preferredLanguage: 'English',
    schoolId: '',
    defaultTemplate: '',
    googleDriveEnabled: false,
    autoProcess: true,
    emailNotifications: true,
    darkMode: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await userSettingsService.getAll()
      if (data.length > 0) {
        setSettings(data[0])
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      await userSettingsService.create(settings)
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
      console.error('Error saving settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-lg text-gray-600">
          Configure your preferences and application settings
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <ApperIcon name="User" size={20} />
            <span>Profile Settings</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
              <select
                value={settings.preferredLanguage}
                onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="English">English</option>
                <option value="Malay">Bahasa Melayu</option>
                <option value="Chinese">中文</option>
                <option value="Tamil">தமிழ்</option>
              </select>
            </div>

            <Input
              label="School ID"
              value={settings.schoolId}
              onChange={(e) => handleInputChange('schoolId', e.target.value)}
              placeholder="Enter your school ID"
              icon="School"
            />

            <Input
              label="Default Template Path"
              value={settings.defaultTemplate}
              onChange={(e) => handleInputChange('defaultTemplate', e.target.value)}
              placeholder="Path to default template"
              icon="FileText"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <ApperIcon name="Settings" size={20} />
            <span>Application Settings</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Google Drive Integration</h3>
                <p className="text-sm text-gray-500">Enable Google Drive for file storage</p>
              </div>
              <button
                onClick={() => handleToggle('googleDriveEnabled')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.googleDriveEnabled ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.googleDriveEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Auto Process</h3>
                <p className="text-sm text-gray-500">Automatically process uploaded files</p>
              </div>
              <button
                onClick={() => handleToggle('autoProcess')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.autoProcess ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.autoProcess ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive processing updates via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                <p className="text-sm text-gray-500">Enable dark theme (coming soon)</p>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                disabled
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors opacity-50
                  ${settings.darkMode ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <ApperIcon name="Info" size={20} />
          <span>About Checkgu</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="Zap" size={24} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Fast Processing</h3>
            <p className="text-sm text-gray-600">Process lesson plans in seconds</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="Shield" size={24} className="text-success-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
            <p className="text-sm text-gray-600">Your data is protected and private</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ApperIcon name="Users" size={24} className="text-secondary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Teacher-Focused</h3>
            <p className="text-sm text-gray-600">Built specifically for educators</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={saveSettings}
          loading={loading}
          icon="Save"
        >
          Save Settings
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage