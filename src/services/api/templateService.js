import mockTemplates from '@/services/mockData/templates.json'

let templates = [...mockTemplates]
let nextId = Math.max(...templates.map(t => t.Id)) + 1

export const templateService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...templates]
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const template = templates.find(t => t.Id === parseInt(id))
    if (!template) {
      throw new Error('Template not found')
    }
    return { ...template }
  },

async create(templateData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Validate and ensure fields have proper structure
    const validatedFields = (templateData.fields || []).map(field => ({
      id: field?.id || Date.now() + Math.random(),
      label: field?.label || '',
      type: field?.type || 'text',
      required: field?.required || false,
      placeholder: field?.placeholder || '',
      options: field?.options || []
    }))
    
    const newTemplate = {
      Id: nextId++,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      content: templateData.content || '',
      fields: validatedFields,
      layout: templateData.layout || 'single-column',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    templates.push(newTemplate)
    return { ...newTemplate }
  },

  async update(id, templateData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = templates.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Template not found')
    }
    
// Validate and ensure fields have proper structure
    const validatedFields = (templateData.fields || []).map(field => ({
      id: field?.id || Date.now() + Math.random(),
      label: field?.label || '',
      type: field?.type || 'text',
      required: field?.required || false,
      placeholder: field?.placeholder || '',
      options: field?.options || []
    }))
    
    const updatedTemplate = {
      ...templates[index],
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      content: templateData.content,
      fields: validatedFields,
      layout: templateData.layout || 'single-column',
      updatedAt: new Date().toISOString()
    }
    
    templates[index] = updatedTemplate
    return { ...updatedTemplate }
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = templates.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Template not found')
    }
    
    templates.splice(index, 1)
    return true
  }
}