import JSZip from 'jszip';
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
      
      // Generate proper DOCX file using JSZip
      const docxBuffer = await this.generateValidDocxContent(item)
      
      // Create blob with proper DOCX MIME type
      const blob = new Blob([docxBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      
      return blob
    } catch (error) {
      console.error('Download error:', error)
      throw new Error(`Failed to generate DOCX file: ${error.message}`)
    }
  }

async generateValidDocxContent(item) {
    try {
      // Create a proper DOCX file using JSZip
      const zip = new JSZip()
      
      // Content Types file - defines MIME types for all parts
      const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
      
      // Root relationships file
      const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
      
      // Word document relationships
      const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
      
      // Document styles
      const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr>
      <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
    </w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:eastAsia="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:sz w:val="56"/>
      <w:szCs w:val="56"/>
    </w:rPr>
  </w:style>
</w:styles>`
      
      // Main document content with proper structure
      const documentContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:t>Lesson Plan: ${this.escapeXml(item.fileName || 'Untitled')}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t></w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Subject: </w:t>
      </w:r>
      <w:r>
        <w:t>${this.escapeXml(item.subject || 'N/A')}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Grade: </w:t>
      </w:r>
      <w:r>
        <w:t>${this.escapeXml(item.grade || 'N/A')}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Upload Date: </w:t>
      </w:r>
      <w:r>
        <w:t>${this.escapeXml(new Date(item.uploadDate).toLocaleDateString())}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Status: </w:t>
      </w:r>
      <w:r>
        <w:t>${this.escapeXml(item.status)}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t></w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Lesson Content:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>This is a generated lesson plan document. In a production environment, this would contain the actual lesson plan content with properly formatted learning objectives, activities, and assessment criteria.</w:t>
      </w:r>
    </w:p>
    ${item.placeholders ? this.generatePlaceholderContent(item.placeholders) : ''}
    <w:p>
      <w:r>
        <w:t></w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:i/>
        </w:rPr>
        <w:t>Generated by Checkgu - Lesson Plan Management System</w:t>
      </w:r>
    </w:p>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`
      
      // Add all files to the ZIP structure
      zip.file('[Content_Types].xml', contentTypes)
      zip.file('_rels/.rels', rootRels)
      zip.file('word/_rels/document.xml.rels', wordRels)
      zip.file('word/document.xml', documentContent)
      zip.file('word/styles.xml', styles)
      
      // Generate the ZIP file as array buffer
      const zipBuffer = await zip.generateAsync({
        type: 'arraybuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      })
      
      return zipBuffer
    } catch (error) {
      console.error('Error generating DOCX content:', error)
      throw new Error(`DOCX generation failed: ${error.message}`)
    }
  }
  
  // Helper method to escape XML characters
  escapeXml(text) {
    if (!text) return ''
    return text.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
  
  // Helper method to generate placeholder content
  generatePlaceholderContent(placeholders) {
    if (!placeholders || typeof placeholders !== 'object') return ''
    
    const entries = Object.entries(placeholders)
    if (entries.length === 0) return ''
    
    let content = `
    <w:p>
      <w:r>
        <w:t></w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Template Placeholders:</w:t>
      </w:r>
    </w:p>`
    
    entries.forEach(([key, value]) => {
      content += `
    <w:p>
      <w:r>
        <w:t>• ${this.escapeXml(key)}: ${this.escapeXml(value)}</w:t>
      </w:r>
    </w:p>`
    })
    
    return content
  }
}

// Export both the class and an instance for different import patterns
export default LessonPlanService;
export const lessonPlanService = new LessonPlanService();