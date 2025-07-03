import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'
import SearchBar from '@/components/molecules/SearchBar'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import { templateService } from '@/services/api/templateService'

const TemplatesPage = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'lesson-plan',
    content: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await templateService.getAll()
      setTemplates(data)
    } catch (err) {
      setError('Failed to load templates')
      console.error('Error loading templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return
    }

    try {
      const newTemplate = await templateService.create(formData)
      setTemplates(prev => [...prev, newTemplate])
      setShowCreateModal(false)
      setFormData({ name: '', description: '', category: 'lesson-plan', content: '' })
      toast.success('Template created successfully!')
    } catch (err) {
      toast.error('Failed to create template')
      console.error('Error creating template:', err)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required')
      return
    }

    try {
      const updatedTemplate = await templateService.update(editingTemplate.Id, formData)
      setTemplates(prev => prev.map(t => t.Id === editingTemplate.Id ? updatedTemplate : t))
      setEditingTemplate(null)
      setFormData({ name: '', description: '', category: 'lesson-plan', content: '' })
      toast.success('Template updated successfully!')
    } catch (err) {
      toast.error('Failed to update template')
      console.error('Error updating template:', err)
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      await templateService.delete(id)
      setTemplates(prev => prev.filter(t => t.Id !== id))
      toast.success('Template deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete template')
      console.error('Error deleting template:', err)
    }
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      content: template.content
    })
  }

  const handleCancelEdit = () => {
    setEditingTemplate(null)
    setFormData({ name: '', description: '', category: 'lesson-plan', content: '' })
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'lesson-plan', label: 'Lesson Plans' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'worksheet', label: 'Worksheets' },
    { value: 'report', label: 'Reports' }
  ]

  if (loading) return <Loading />
  if (error) return <Error message={error} />

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-lg text-gray-600">
            Manage your lesson plan templates and educational resources
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            icon="ArrowLeft"
            onClick={() => navigate('/settings')}
          >
            Back to Settings
          </Button>
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setShowCreateModal(true)}
          >
            Create Template
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search templates..."
          />
        </div>
        
        <div className="lg:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Empty
          icon="FileText"
          title="No templates found"
          description={searchTerm || selectedCategory !== 'all' 
            ? "No templates match your current filters" 
            : "Create your first template to get started"}
          action={
            <Button
              variant="primary"
              icon="Plus"
              onClick={() => setShowCreateModal(true)}
            >
              Create Template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: template.Id * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="FileText" size={20} className="text-primary-600" />
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {categories.find(c => c.value === template.category)?.label || template.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{template.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => handleEditTemplate(template)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => handleDeleteTemplate(template.Id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <Input
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                icon="FileText"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the template"
                icon="Info"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter template content..."
                  rows={8}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={editingTemplate ? handleCancelEdit : () => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={editingTemplate ? "Save" : "Plus"}
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TemplatesPage