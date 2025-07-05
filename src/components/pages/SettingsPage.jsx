import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import GoogleDriveModal from "@/components/organisms/GoogleDriveModal";
import ScheduleSetup from "@/components/organisms/ScheduleSetup";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import { userSettingsService } from "@/services/api/userSettingsService";
import { googleDriveService } from "@/services/api/googleDriveService";
import { subjectService } from "@/services/api/subjectService";
import { classService } from "@/services/api/classService";
import { useI18n } from "@/contexts/I18nContext";
const SettingsPage = () => {
  const navigate = useNavigate()
  const { currentLanguage, changeLanguage, getLanguageOptions } = useI18n()
  const [settings, setSettings] = useState({
    preferredLanguage: 'English',
    schoolId: '',
    defaultTemplate: '',
    googleDriveEnabled: false,
    googleDriveConnected: false,
    googleDriveEmail: '',
    autoProcess: true,
    emailNotifications: true,
    darkMode: false
  })
  const [loading, setLoading] = useState(false)
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', description: '', studentCount: '' })
  const [newSubject, setNewSubject] = useState({ name: '', description: '', category: 'Core' })
  const [showClassForm, setShowClassForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
useEffect(() => {
    loadSettings()
    if (activeTab === 'teaching') {
      loadClasses()
      loadSubjects()
    }
  }, [activeTab])

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

  const loadClasses = async () => {
    setLoadingClasses(true)
    try {
      const data = await classService.getAll()
      setClasses(data)
    } catch (err) {
      console.error('Error loading classes:', err)
      toast.error('Failed to load classes')
    } finally {
      setLoadingClasses(false)
    }
  }

  const loadSubjects = async () => {
    setLoadingSubjects(true)
    try {
      const data = await subjectService.getAll()
      setSubjects(data)
    } catch (err) {
      console.error('Error loading subjects:', err)
      toast.error('Failed to load subjects')
    } finally {
      setLoadingSubjects(false)
    }
  }

  const addClass = async () => {
    if (!newClass.name || !newClass.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await classService.create({
        ...newClass,
        studentCount: parseInt(newClass.studentCount) || 0,
        academic_year: new Date().getFullYear().toString()
      })
      toast.success('Class added successfully')
      setNewClass({ name: '', description: '', studentCount: '' })
      setShowClassForm(false)
      loadClasses()
    } catch (err) {
      toast.error('Failed to add class')
      console.error('Error adding class:', err)
    }
  }

  const addSubject = async () => {
    if (!newSubject.name || !newSubject.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const subjectColors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-orange-100 text-orange-800',
      'bg-cyan-100 text-cyan-800',
      'bg-gray-100 text-gray-800'
    ]

    try {
      await subjectService.create({
        ...newSubject,
        color: subjectColors[Math.floor(Math.random() * subjectColors.length)]
      })
      toast.success('Subject added successfully')
      setNewSubject({ name: '', description: '', category: 'Core' })
      setShowSubjectForm(false)
      loadSubjects()
    } catch (err) {
      toast.error('Failed to add subject')
      console.error('Error adding subject:', err)
    }
  }

  const deleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.delete(classId)
        toast.success('Class deleted successfully')
        loadClasses()
      } catch (err) {
        toast.error('Failed to delete class')
        console.error('Error deleting class:', err)
      }
    }
  }

  const deleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.delete(subjectId)
        toast.success('Subject deleted successfully')
        loadSubjects()
      } catch (err) {
        toast.error('Failed to delete subject')
        console.error('Error deleting subject:', err)
      }
    }
  }

const saveSettings = async () => {
    setLoading(true)
    try {
      // Ensure the settings object reflects the current language from context
      const settingsToSave = {
        ...settings,
        preferredLanguage: currentLanguage
      }
      await userSettingsService.create(settingsToSave)
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
      console.error('Error saving settings:', err)
    } finally {
      setLoading(false)
    }
  }

const handleInputChange = (field, value) => {
    if (field === 'preferredLanguage') {
      changeLanguage(value)
      // Update local settings state to reflect the language change
      setSettings(prev => ({
        ...prev,
        preferredLanguage: value
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

const handleToggle = (field) => {
    if (field === 'googleDriveEnabled') {
      if (!settings.googleDriveConnected) {
        setShowGoogleDriveModal(true)
        return
      }
    }
    
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleGoogleDriveConnect = async (result) => {
    setSettings(prev => ({
      ...prev,
      googleDriveEnabled: true,
      googleDriveConnected: true,
      googleDriveEmail: result.userEmail
    }))
    setShowGoogleDriveModal(false)
  }

  const handleGoogleDriveDisconnect = async () => {
    try {
      await googleDriveService.disconnect()
      setSettings(prev => ({
        ...prev,
        googleDriveEnabled: false,
        googleDriveConnected: false,
        googleDriveEmail: ''
      }))
      toast.success('Google Drive disconnected successfully!')
    } catch (err) {
      toast.error('Failed to disconnect Google Drive')
      console.error('Disconnect error:', err)
    }
  }

const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: 'User' },
    { id: 'application', label: 'Application Settings', icon: 'Settings' },
    { id: 'teaching', label: 'Teaching Schedule', icon: 'Calendar' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
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
                  {getLanguageOptions().map(language => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
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
              
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  icon="FileText"
                  onClick={() => navigate('/templates')}
                  className="w-full"
                >
                  Manage Templates
                </Button>
              </div>
            </div>
          </Card>
        )
      
      case 'application':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <ApperIcon name="Settings" size={20} />
              <span>Application Settings</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Google Drive Integration</h3>
                  <p className="text-sm text-gray-500">
                    {settings.googleDriveConnected 
                      ? `Connected as ${settings.googleDriveEmail}` 
                      : 'Enable Google Drive for file storage'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('googleDriveEnabled')}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.googleDriveConnected ? 'bg-primary-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.googleDriveConnected ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {settings.googleDriveConnected && (
                <div className="flex items-center justify-between pl-4 border-l-2 border-primary-200">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="CheckCircle" size={16} className="text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Connected</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Unlink"
                    onClick={handleGoogleDriveDisconnect}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Disconnect
                  </Button>
                </div>
              )}

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
        )
      
      case 'teaching':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <ApperIcon name="Users" size={20} />
                    <span>Classes</span>
                  </h2>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="Plus"
                    onClick={() => setShowClassForm(!showClassForm)}
                  >
                    Add Class
                  </Button>
                </div>

                {showClassForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                      <Input
                        label="Class Name"
                        value={newClass.name}
                        onChange={(e) => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Grade 5A"
                      />
                      <Input
                        label="Description"
                        value={newClass.description}
                        onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Primary 5 Class A"
                      />
                      <Input
                        label="Student Count"
                        type="number"
                        value={newClass.studentCount}
                        onChange={(e) => setNewClass(prev => ({ ...prev, studentCount: e.target.value }))}
                        placeholder="0"
                      />
                      <div className="flex space-x-2">
                        <Button variant="primary" size="sm" onClick={addClass}>Add</Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowClassForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loadingClasses ? (
                    <div className="flex items-center justify-center py-8">
                      <ApperIcon name="Loader" size={20} className="animate-spin text-gray-400" />
                    </div>
                  ) : (
                    classes.map(cls => (
                      <div key={cls.Id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{cls.name}</h3>
                          <p className="text-sm text-gray-500">{cls.description}</p>
                          <p className="text-xs text-gray-400">{cls.studentCount} students</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="X"
                          onClick={() => deleteClass(cls.Id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        />
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <ApperIcon name="BookOpen" size={20} />
                    <span>Subjects</span>
                  </h2>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="Plus"
                    onClick={() => setShowSubjectForm(!showSubjectForm)}
                  >
                    Add Subject
                  </Button>
                </div>

                {showSubjectForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                      <Input
                        label="Subject Name"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Mathematics"
                      />
                      <Input
                        label="Description"
                        value={newSubject.description}
                        onChange={(e) => setNewSubject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., Primary Mathematics"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={newSubject.category}
                          onChange={(e) => setNewSubject(prev => ({ ...prev, category: e.target.value }))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="Core">Core</option>
                          <option value="Language">Language</option>
                          <option value="Social Studies">Social Studies</option>
                          <option value="Creative">Creative</option>
                          <option value="Physical">Physical</option>
                          <option value="Technology">Technology</option>
                        </select>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="primary" size="sm" onClick={addSubject}>Add</Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowSubjectForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loadingSubjects ? (
                    <div className="flex items-center justify-center py-8">
                      <ApperIcon name="Loader" size={20} className="animate-spin text-gray-400" />
                    </div>
                  ) : (
                    subjects.map(subject => (
                      <div key={subject.Id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{subject.name}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${subject.color}`}>
                              {subject.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{subject.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="X"
                          onClick={() => deleteSubject(subject.Id)}
className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        />
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
            {/* Level Overview Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ApperIcon name="Layers" size={20} />
                <span>Level Overview</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(classes.reduce((acc, cls) => {
                  const level = cls.level || 'Unassigned'
                  if (!acc[level]) acc[level] = []
                  acc[level].push(cls)
                  return acc
                }, {})).map(([levelName, levelClasses]) => (
                  <div key={levelName} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{levelName}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Users" size={12} />
                        <span>{levelClasses.length} classes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="UserCheck" size={12} />
                        <span>{levelClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ApperIcon name="Calendar" size={20} />
                <span>Teaching Schedule & Level Management</span>
              </h2>
              <ScheduleSetup />
            </Card>
        )
      
      default:
        return null
    }
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

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {renderTabContent()}
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

      <GoogleDriveModal
        isOpen={showGoogleDriveModal}
        onClose={() => setShowGoogleDriveModal(false)}
        onConnect={handleGoogleDriveConnect}
      />
    </div>
  )
}

export default SettingsPage