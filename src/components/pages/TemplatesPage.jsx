import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
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
    content: '',
    fields: [],
    layout: 'single-column'
  })
  const [activeTab, setActiveTab] = useState('basic')
  const [editingField, setEditingField] = useState(null)
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [fieldData, setFieldData] = useState({
    label: '',
    type: 'text',
    required: false,
    options: [],
    placeholder: ''
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
setFormData({ name: '', description: '', category: 'lesson-plan', content: '', fields: [], layout: 'single-column' })
      setActiveTab('basic')
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
setFormData({ name: '', description: '', category: 'lesson-plan', content: '', fields: [], layout: 'single-column' })
      setActiveTab('basic')
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
      content: template.content,
      fields: template.fields || [],
      layout: template.layout || 'single-column'
    })
  }

const handleCancelEdit = () => {
    setEditingTemplate(null)
    setFormData({ name: '', description: '', category: 'lesson-plan', content: '', fields: [], layout: 'single-column' })
    setActiveTab('basic')
  }

  const handleFieldDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(formData.fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFormData(prev => ({ ...prev, fields: items }))
  }

  const handleAddField = () => {
    setEditingField(null)
    setFieldData({
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: ''
    })
    setShowFieldModal(true)
  }

  const handleEditField = (field, index) => {
    setEditingField(index)
    setFieldData({ ...field })
    setShowFieldModal(true)
  }

  const handleSaveField = () => {
    if (!fieldData.label.trim()) {
      toast.error('Field label is required')
      return
    }

    const newField = {
      ...fieldData,
      id: editingField !== null ? formData.fields[editingField].id : Date.now()
    }

    if (editingField !== null) {
      const updatedFields = [...formData.fields]
      updatedFields[editingField] = newField
      setFormData(prev => ({ ...prev, fields: updatedFields }))
    } else {
      setFormData(prev => ({ ...prev, fields: [...prev.fields, newField] }))
    }

    setShowFieldModal(false)
    setEditingField(null)
    setFieldData({
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: ''
    })
  }

  const handleDeleteField = (index) => {
    if (confirm('Are you sure you want to delete this field?')) {
      const updatedFields = formData.fields.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, fields: updatedFields }))
    }
  }

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' }
  ]

  const layoutOptions = [
    { value: 'single-column', label: 'Single Column' },
    { value: 'two-column', label: 'Two Columns' },
    { value: 'grid', label: 'Grid Layout' }
  ]

  const renderFieldPreview = (field) => {
    const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
    
    switch (field.type) {
      case 'textarea':
        return <textarea className={baseClasses} placeholder={field.placeholder} rows={3} />
      case 'select':
        return (
          <select className={baseClasses}>
            <option>Choose an option...</option>
            {field.options.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
            <span className="text-sm text-gray-700">{field.label}</span>
          </div>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input type="radio" name={`field-${field.id}`} className="text-primary-600" />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        )
      case 'date':
        return <input type="date" className={baseClasses} />
      case 'number':
        return <input type="number" className={baseClasses} placeholder={field.placeholder} />
      default:
        return <input type="text" className={baseClasses} placeholder={field.placeholder} />
    }
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
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              
              {/* Tab Navigation */}
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'basic'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab('form')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'form'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Form Builder
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
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
              )}

              {/* Form Builder Tab */}
              {activeTab === 'form' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
                      <p className="text-sm text-gray-600">Add and arrange form fields for your template</p>
                    </div>
                    <Button
                      variant="primary"
                      icon="Plus"
                      onClick={handleAddField}
                    >
                      Add Field
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
                    <select
                      value={formData.layout}
                      onChange={(e) => setFormData(prev => ({ ...prev, layout: e.target.value }))}
                      className="block w-60 px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                    >
                      {layoutOptions.map((layout) => (
                        <option key={layout.value} value={layout.value}>
                          {layout.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.fields.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <ApperIcon name="FormInput" size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No fields added yet</h3>
                      <p className="text-gray-600 mb-4">Start building your form by adding fields</p>
                      <Button
                        variant="primary"
                        icon="Plus"
                        onClick={handleAddField}
                      >
                        Add Your First Field
                      </Button>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleFieldDragEnd}>
                      <Droppable droppableId="fields">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-3 drag-drop-zone ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                          >
                            {formData.fields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`bg-gray-50 border border-gray-200 rounded-lg p-4 draggable-item ${
                                      snapshot.isDragging ? 'is-dragging' : ''
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="drag-handle cursor-grab text-gray-400 hover:text-gray-600"
                                        >
                                          <ApperIcon name="GripVertical" size={20} />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{field.label}</h4>
                                          <p className="text-sm text-gray-600">
                                            {fieldTypes.find(t => t.value === field.type)?.label}
                                            {field.required && ' • Required'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          icon="Edit"
                                          onClick={() => handleEditField(field, index)}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          icon="Trash2"
                                          onClick={() => handleDeleteField(index)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h3>
                  
                  {formData.content && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                      <div className="whitespace-pre-wrap text-sm text-gray-700">{formData.content}</div>
                    </div>
                  )}

                  {formData.fields.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Form Fields</h4>
                      <div className={`space-y-4 ${
                        formData.layout === 'two-column' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' :
                        formData.layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' :
                        'space-y-4'
                      }`}>
                        {formData.fields.map((field, index) => (
                          <div key={field.id} className="space-y-2">
                            {field.type !== 'checkbox' && (
                              <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                            )}
                            {renderFieldPreview(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!formData.content && formData.fields.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <ApperIcon name="Eye" size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nothing to preview yet</h3>
                      <p className="text-gray-600">Add some content or form fields to see the preview</p>
                    </div>
                  )}
                </div>
              )}
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

      {/* Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingField !== null ? 'Edit Field' : 'Add Field'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <Input
                label="Field Label"
                value={fieldData.label}
                onChange={(e) => setFieldData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Enter field label"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                <select
                  value={fieldData.type}
                  onChange={(e) => setFieldData(prev => ({ ...prev, type: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Placeholder Text"
                value={fieldData.placeholder}
                onChange={(e) => setFieldData(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Enter placeholder text"
              />

              {(fieldData.type === 'select' || fieldData.type === 'radio') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <textarea
                    value={fieldData.options.join('\n')}
                    onChange={(e) => setFieldData(prev => ({ 
                      ...prev, 
                      options: e.target.value.split('\n').filter(option => option.trim()) 
                    }))}
                    placeholder="Enter each option on a new line"
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={fieldData.required}
                  onChange={(e) => setFieldData(prev => ({ ...prev, required: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                  Required field
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowFieldModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon="Save"
                onClick={handleSaveField}
              >
                {editingField !== null ? 'Update Field' : 'Add Field'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TemplatesPage