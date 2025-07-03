import React from "react";
import Error from "@/components/ui/Error";
import lessonPlansData from "@/services/mockData/lessonPlans.json";

class LessonPlanService {
  constructor() {
    this.data = [...lessonPlansData]
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getAll() {
    await this.delay()
    return [...this.data]
  }

  async getById(id) {
    await this.delay()
    const item = this.data.find(item => item.Id === parseInt(id))
    return item ? { ...item } : null
  }

  async create(item) {
    await this.delay()
    const newId = Math.max(...this.data.map(item => item.Id), 0) + 1
    const newItem = {
      ...item,
      Id: newId,
      googleDriveExported: false,
      googleDriveUrl: '',
      exportedAt: null
    }
    this.data.push(newItem)
    return { ...newItem }
  }

  async update(id, updates) {
    await this.delay()
    const index = this.data.findIndex(item => item.Id === parseInt(id))
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates }
      return { ...this.data[index] }
    }
    throw new Error('Item not found')
  }

  async delete(id) {
    await this.delay()
    const index = this.data.findIndex(item => item.Id === parseInt(id))
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Item not found')
  }

async downloadFile(id) {
    try {
      const item = await this.getById(id)
      
      if (!item) {
        throw new Error('File not found')
      }
      
      if (item.status !== 'completed') {
        throw new Error('File is not ready for download')
      }
      
      // Note: This is a placeholder implementation. In a real application,
      // you would fetch the actual DOCX file from your server or storage service.
      // The current implementation creates a safe downloadable file that won't corrupt.
      const placeholderContent = `This is a placeholder for ${item.fileName}.
      
In a production environment, this would be replaced with:
- Actual DOCX file content from your storage service
- Properly formatted lesson plan template
- Dynamic content based on the lesson plan data

File Details:
- Name: ${item.fileName}
- Subject: ${item.subject || 'N/A'}
- Grade: ${item.grade || 'N/A'}
- Upload Date: ${item.uploadDate}
- Status: ${item.status}

To implement proper DOCX generation, consider using libraries like:
- docx4js for DOCX manipulation
- officegen for generating Office documents
- mammoth.js for DOCX processing`
      
      // Use application/octet-stream for safe binary downloads
      // This prevents Word from trying to open corrupted content
      const blob = new Blob([placeholderContent], {
        type: 'application/octet-stream'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Change extension to .txt to avoid confusion until proper DOCX is implemented
      a.download = item.fileName.replace('.docx', '_placeholder.txt')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return { success: true, message: 'File downloaded successfully' }
    } catch (error) {
      console.error('Download error:', error)
      throw error
    }
  }
}

// Export both the class and an instance for different import patterns
export default LessonPlanService;
export const lessonPlanService = new LessonPlanService();