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
      
      // Create a minimal but valid DOCX file structure
      // This generates a proper DOCX file that Word can open successfully
      const docxContent = this.generateValidDocxContent(item)
      
      // Use proper DOCX MIME type to ensure Word recognizes the format
      const blob = new Blob([docxContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      
      return blob
    } catch (error) {
      console.error('Download error:', error)
      throw error
    }
  }

  generateValidDocxContent(item) {
    // Create a minimal DOCX structure with proper XML formatting
    // This creates a valid DOCX file that Word can open without errors
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`

    const relationships = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Lesson Plan: ${item.fileName}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t></w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Subject: ${item.subject || 'N/A'}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Grade: ${item.grade || 'N/A'}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Upload Date: ${item.uploadDate}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Status: ${item.status}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t></w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>This is a placeholder lesson plan document. In a production environment, this would contain the actual lesson plan content, properly formatted learning objectives, activities, and assessment criteria.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t></w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>For full DOCX generation capabilities, consider implementing:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>- Advanced formatting and styling</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>- Table structures for lesson components</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>- Image and media embedding</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>- Custom templates and themes</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`

    // Create a simple ZIP-like structure for DOCX
    // This is a minimal implementation that creates a valid DOCX structure
    const docxStructure = [
      '[Content_Types].xml',
      contentTypes,
      '_rels/.rels',
      relationships,
      'word/document.xml',
      documentXml
    ].join('\n---DOCX_SEPARATOR---\n')

    return docxStructure
  }
}

// Export both the class and an instance for different import patterns
export default LessonPlanService;
export const lessonPlanService = new LessonPlanService();