import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { googleDriveService } from '@/services/api/googleDriveService'
import { userSettingsService } from '@/services/api/userSettingsService'

const GoogleDriveModal = ({ isOpen, onClose, onConnect, initialAction = 'connect' }) => {
  const [step, setStep] = useState('initial') // initial, connecting, connected, error
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (isOpen) {
      checkConnectionStatus()
    }
  }, [isOpen])

  const checkConnectionStatus = async () => {
    try {
      const status = await googleDriveService.getConnectionStatus()
      setConnectionStatus(status)
      if (status.connected) {
        setStep('connected')
        setUserEmail(status.userEmail || 'user@gmail.com')
      } else {
        setStep('initial')
      }
    } catch (err) {
      console.error('Error checking connection status:', err)
      setStep('initial')
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    setStep('connecting')

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = await googleDriveService.connect()
      
      if (result.success) {
        setStep('connected')
        setUserEmail(result.userEmail)
        setConnectionStatus({
          connected: true,
          userEmail: result.userEmail,
          connectedAt: new Date().toISOString()
        })
        
        // Update user settings
        const settings = await userSettingsService.getAll()
        if (settings.length > 0) {
          await userSettingsService.update(settings[0].Id, {
            googleDriveEnabled: true,
            googleDriveConnected: true,
            googleDriveEmail: result.userEmail
          })
        }

        toast.success('Google Drive connected successfully!')
        onConnect && onConnect(result)
      } else {
        throw new Error('Connection failed')
      }
    } catch (err) {
      setStep('error')
      toast.error('Failed to connect to Google Drive')
      console.error('Google Drive connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)

    try {
      await googleDriveService.disconnect()
      
      // Update user settings
      const settings = await userSettingsService.getAll()
      if (settings.length > 0) {
        await userSettingsService.update(settings[0].Id, {
          googleDriveEnabled: false,
          googleDriveConnected: false,
          googleDriveEmail: ''
        })
      }

      setStep('initial')
      setConnectionStatus(null)
      setUserEmail('')
      toast.success('Google Drive disconnected successfully!')
    } catch (err) {
      toast.error('Failed to disconnect from Google Drive')
      console.error('Google Drive disconnection error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <ApperIcon name="HardDrive" size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Google Drive</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600"
              />
            </div>

            {step === 'initial' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Cloud" size={32} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Google Drive</h3>
                <p className="text-gray-600 mb-6">
                  Connect your Google Drive account to export processed lesson plans directly to your drive. 
                  This will allow you to save and organize your documents in the cloud.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={handleConnect}
                    loading={loading}
                    icon="Link"
                    className="w-full"
                  >
                    Connect to Google Drive
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    disabled={loading}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'connecting' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <ApperIcon name="Loader" size={32} className="text-blue-600" />
                  </motion.div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connecting...</h3>
                <p className="text-gray-600 mb-4">
                  Please complete the authentication in the popup window. This may take a few moments.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <ApperIcon name="Info" size={16} className="inline mr-1" />
                    You may need to allow popups for this site to complete the connection.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'connected' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="CheckCircle" size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Successfully Connected!</h3>
                <p className="text-gray-600 mb-4">
                  Your Google Drive account is now connected. You can export processed lesson plans directly to your drive.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <ApperIcon name="Mail" size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">{userEmail}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={handleClose}
                    icon="CheckCircle"
                    className="w-full"
                  >
                    Done
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDisconnect}
                    loading={loading}
                    icon="Unlink"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Disconnect Account
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="AlertCircle" size={32} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't connect to your Google Drive account. Please check your internet connection and try again.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={handleConnect}
                    loading={loading}
                    icon="RefreshCw"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    disabled={loading}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default GoogleDriveModal