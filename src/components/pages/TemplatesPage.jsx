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
  const [showGenerateModal, setShowGenerateModal] = useState(false)
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
      id: editingField !== null ? (formData.fields[editingField]?.id || Date.now()) : Date.now()
    }

    // Validate field has required properties
    if (!newField.id || !newField.label || !newField.type) {
      console.error('Invalid field data:', newField)
      return
    }

    if (editingField !== null) {
      const updatedFields = [...(formData.fields || [])]
      updatedFields[editingField] = newField
      setFormData(prev => ({ ...prev, fields: updatedFields }))
    } else {
      setFormData(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }))
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

  const completeTemplateOptions = [
    {
      value: 'lesson-plan',
      label: 'Complete Lesson Plan',
      icon: 'BookOpen',
      color: 'bg-blue-500',
      description: 'Comprehensive lesson planning template with objectives, activities, assessments, and reflection sections.',
      features: ['Learning Objectives', 'Materials List', 'Activities', 'Assessment Rubric', 'Reflection Notes']
    },
    {
      value: 'assessment',
      label: 'Complete Assessment',
      icon: 'ClipboardCheck',
      color: 'bg-green-500',
      description: 'Full assessment template with rubrics, scoring criteria, feedback sections, and grade tracking.',
      features: ['Rubric Grid', 'Score Tracking', 'Feedback Forms', 'Performance Indicators', 'Grade Analytics']
    },
    {
      value: 'worksheet',
      label: 'Complete Worksheet',
      icon: 'FileText',
      color: 'bg-orange-500',
      description: 'Interactive worksheet template with various question types, instructions, and answer keys.',
      features: ['Multiple Choice', 'Short Answer', 'Essay Questions', 'Answer Key', 'Instructions']
    },
    {
      value: 'report',
      label: 'Complete Report',
      icon: 'BarChart3',
      color: 'bg-purple-500',
      description: 'Comprehensive reporting template with data analysis, charts, conclusions, and recommendations.',
      features: ['Data Tables', 'Analysis Sections', 'Conclusions', 'Recommendations', 'Appendices']
    }
  ]

  const handleGenerateCompleteTemplate = () => {
    setShowGenerateModal(true)
  }

  const generateCompleteTemplate = async (templateType) => {
    const templates = {
      'lesson-plan': {
        name: 'Complete Lesson Plan Template',
        description: 'A comprehensive lesson planning template with all essential sections for effective teaching and learning.',
        category: 'lesson-plan',
        content: `# Lesson Plan Template

## Basic Information
- **Subject:** [Enter Subject]
- **Grade Level:** [Enter Grade]
- **Duration:** [Enter Duration]
- **Date:** [Enter Date]

## Learning Objectives
By the end of this lesson, students will be able to:
- [Objective 1]
- [Objective 2]
- [Objective 3]

## Materials Needed
- [Material 1]
- [Material 2]
- [Material 3]

## Lesson Structure

### Introduction (10 minutes)
- Hook/Attention grabber
- Connect to prior learning
- State learning objectives

### Main Activity (25 minutes)
- Detailed activity description
- Student roles and responsibilities
- Teacher facilitation notes

### Assessment (10 minutes)
- Formative assessment strategy
- Success criteria
- Evidence of learning

### Closure (5 minutes)
- Summary of key points
- Preview of next lesson
- Exit ticket or reflection

## Differentiation Strategies
- For struggling learners
- For advanced learners
- For English language learners

## Assessment and Evaluation
- Assessment methods
- Rubric criteria
- Feedback strategies

## Reflection and Notes
- What worked well?
- What would you change?
- Student engagement observations
- Next steps`,
        layout: 'single-column',
        fields: [
          { id: Date.now() + 1, label: 'Subject', type: 'text', required: true, placeholder: 'Enter subject name', options: [] },
          { id: Date.now() + 2, label: 'Grade Level', type: 'select', required: true, placeholder: '', options: ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
          { id: Date.now() + 3, label: 'Lesson Duration', type: 'select', required: true, placeholder: '', options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes'] },
          { id: Date.now() + 4, label: 'Date', type: 'date', required: true, placeholder: '', options: [] },
          { id: Date.now() + 5, label: 'Learning Objective 1', type: 'textarea', required: true, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 6, label: 'Learning Objective 2', type: 'textarea', required: false, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 7, label: 'Learning Objective 3', type: 'textarea', required: false, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 8, label: 'Required Materials', type: 'textarea', required: true, placeholder: 'List all materials needed for the lesson', options: [] },
          { id: Date.now() + 9, label: 'Introduction Activity', type: 'textarea', required: true, placeholder: 'Describe the hook or attention grabber', options: [] },
          { id: Date.now() + 10, label: 'Main Learning Activity', type: 'textarea', required: true, placeholder: 'Detailed description of the main activity', options: [] },
          { id: Date.now() + 11, label: 'Assessment Strategy', type: 'select', required: true, placeholder: '', options: ['Formative Assessment', 'Summative Assessment', 'Peer Assessment', 'Self Assessment', 'Portfolio Assessment'] },
          { id: Date.now() + 12, label: 'Differentiation Notes', type: 'textarea', required: false, placeholder: 'How will you adapt for different learners?', options: [] },
          { id: Date.now() + 13, label: 'Lesson Reflection', type: 'textarea', required: false, placeholder: 'Post-lesson reflection notes', options: [] }
        ]
      },
      'assessment': {
        name: 'Complete Assessment Template',
        description: 'A comprehensive assessment template with rubrics, scoring criteria, and detailed feedback sections.',
        category: 'assessment',
        content: `# Assessment Template

## Assessment Overview
- **Assessment Type:** [Formative/Summative]
- **Subject:** [Enter Subject]
- **Topic:** [Enter Topic]
- **Total Points:** [Enter Points]
- **Time Allowed:** [Enter Duration]

## Learning Standards Assessed
- [Standard 1]
- [Standard 2]
- [Standard 3]

## Assessment Instructions
1. [Instruction 1]
2. [Instruction 2]
3. [Instruction 3]

## Scoring Rubric

### Criteria 1: [Criteria Name]
- **Excellent (4):** [Description]
- **Proficient (3):** [Description]
- **Developing (2):** [Description]
- **Beginning (1):** [Description]

### Criteria 2: [Criteria Name]
- **Excellent (4):** [Description]
- **Proficient (3):** [Description]
- **Developing (2):** [Description]
- **Beginning (1):** [Description]

## Questions/Tasks

### Section A: Multiple Choice (20 points)
[Insert multiple choice questions]

### Section B: Short Answer (30 points)
[Insert short answer questions]

### Section C: Extended Response (50 points)
[Insert essay or project prompts]

## Answer Key
[Provide complete answer key with explanations]

## Feedback Template
- **Strengths:**
- **Areas for Improvement:**
- **Next Steps:**
- **Additional Comments:**

## Grade Calculation
- Section A: ___/20
- Section B: ___/30
- Section C: ___/50
- **Total: ___/100**
- **Letter Grade: ___**`,
        layout: 'single-column',
        fields: [
          { id: Date.now() + 1, label: 'Assessment Type', type: 'select', required: true, placeholder: '', options: ['Formative Assessment', 'Summative Assessment', 'Diagnostic Assessment', 'Performance Assessment', 'Portfolio Assessment'] },
          { id: Date.now() + 2, label: 'Subject', type: 'text', required: true, placeholder: 'Enter subject name', options: [] },
          { id: Date.now() + 3, label: 'Topic/Unit', type: 'text', required: true, placeholder: 'Enter topic or unit being assessed', options: [] },
          { id: Date.now() + 4, label: 'Total Points', type: 'number', required: true, placeholder: '100', options: [] },
          { id: Date.now() + 5, label: 'Time Allowed', type: 'select', required: true, placeholder: '', options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes', 'No time limit'] },
          { id: Date.now() + 6, label: 'Learning Standard 1', type: 'textarea', required: true, placeholder: 'Enter learning standard being assessed', options: [] },
          { id: Date.now() + 7, label: 'Learning Standard 2', type: 'textarea', required: false, placeholder: 'Enter learning standard being assessed', options: [] },
          { id: Date.now() + 8, label: 'Assessment Instructions', type: 'textarea', required: true, placeholder: 'Provide clear instructions for students', options: [] },
          { id: Date.now() + 9, label: 'Rubric Criteria 1', type: 'text', required: true, placeholder: 'Enter first assessment criteria', options: [] },
          { id: Date.now() + 10, label: 'Rubric Criteria 2', type: 'text', required: false, placeholder: 'Enter second assessment criteria', options: [] },
          { id: Date.now() + 11, label: 'Multiple Choice Questions', type: 'textarea', required: false, placeholder: 'Enter multiple choice questions', options: [] },
          { id: Date.now() + 12, label: 'Short Answer Questions', type: 'textarea', required: false, placeholder: 'Enter short answer questions', options: [] },
          { id: Date.now() + 13, label: 'Extended Response Prompt', type: 'textarea', required: false, placeholder: 'Enter essay or project prompt', options: [] },
          { id: Date.now() + 14, label: 'Answer Key', type: 'textarea', required: true, placeholder: 'Provide complete answer key', options: [] }
        ]
      },
      'worksheet': {
        name: 'Complete Interactive Worksheet',
        description: 'A comprehensive worksheet template with various question types, clear instructions, and answer keys.',
        category: 'worksheet',
        content: `# Interactive Worksheet

## Worksheet Information
- **Subject:** [Enter Subject]
- **Topic:** [Enter Topic]
- **Grade Level:** [Enter Grade]
- **Estimated Time:** [Enter Duration]

## Learning Objectives
After completing this worksheet, students will be able to:
- [Objective 1]
- [Objective 2]
- [Objective 3]

## Instructions
1. Read all instructions carefully before beginning
2. Show all work where applicable
3. Use complete sentences for written responses
4. Check your answers before submitting

## Materials Needed
- [Material 1]
- [Material 2]
- [Material 3]

## Section A: Vocabulary (15 points)
Match the terms with their definitions:

1. [Term 1] ____
2. [Term 2] ____
3. [Term 3] ____

a) [Definition A]
b) [Definition B]
c) [Definition C]

## Section B: Multiple Choice (20 points)
Choose the best answer for each question:

1. [Question 1]
   a) [Option A]
   b) [Option B]
   c) [Option C]
   d) [Option D]

## Section C: Short Answer (25 points)
Answer the following questions in 1-2 sentences:

1. [Question 1]
   _________________________________

2. [Question 2]
   _________________________________

## Section D: Problem Solving (25 points)
Show all work for the following problems:

1. [Problem 1]

2. [Problem 2]

## Section E: Extended Response (15 points)
Write a paragraph response to the following prompt:

[Prompt text]

## Answer Key
**Section A:** 1-c, 2-a, 3-b
**Section B:** 1-b, 2-d, 3-a
**Section C:** [Provide sample answers]
**Section D:** [Provide step-by-step solutions]
**Section E:** [Provide rubric and sample response]

## Extension Activities
For students who finish early:
- [Extension 1]
- [Extension 2]
- [Extension 3]`,
        layout: 'single-column',
        fields: [
          { id: Date.now() + 1, label: 'Subject', type: 'text', required: true, placeholder: 'Enter subject name', options: [] },
          { id: Date.now() + 2, label: 'Topic', type: 'text', required: true, placeholder: 'Enter specific topic', options: [] },
          { id: Date.now() + 3, label: 'Grade Level', type: 'select', required: true, placeholder: '', options: ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
          { id: Date.now() + 4, label: 'Estimated Completion Time', type: 'select', required: true, placeholder: '', options: ['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes'] },
          { id: Date.now() + 5, label: 'Learning Objective 1', type: 'textarea', required: true, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 6, label: 'Learning Objective 2', type: 'textarea', required: false, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 7, label: 'Required Materials', type: 'textarea', required: true, placeholder: 'List materials students need', options: [] },
          { id: Date.now() + 8, label: 'Vocabulary Terms', type: 'textarea', required: false, placeholder: 'Enter vocabulary terms and definitions', options: [] },
          { id: Date.now() + 9, label: 'Multiple Choice Questions', type: 'textarea', required: false, placeholder: 'Enter multiple choice questions with options', options: [] },
          { id: Date.now() + 10, label: 'Short Answer Questions', type: 'textarea', required: false, placeholder: 'Enter short answer questions', options: [] },
          { id: Date.now() + 11, label: 'Problem Solving Questions', type: 'textarea', required: false, placeholder: 'Enter problems that require showing work', options: [] },
          { id: Date.now() + 12, label: 'Extended Response Prompt', type: 'textarea', required: false, placeholder: 'Enter essay or paragraph prompt', options: [] },
          { id: Date.now() + 13, label: 'Answer Key', type: 'textarea', required: true, placeholder: 'Provide complete answer key', options: [] },
          { id: Date.now() + 14, label: 'Extension Activities', type: 'textarea', required: false, placeholder: 'Activities for early finishers', options: [] }
        ]
      },
      'report': {
        name: 'Complete Report Template',
        description: 'A comprehensive reporting template with data analysis, conclusions, and detailed recommendations.',
        category: 'report',
        content: `# Comprehensive Report Template

## Executive Summary
[Brief overview of the report's purpose, key findings, and recommendations]

## Report Information
- **Report Title:** [Enter Title]
- **Author:** [Enter Author]
- **Date:** [Enter Date]
- **Report Period:** [Enter Period]
- **Audience:** [Enter Target Audience]

## Table of Contents
1. Introduction
2. Methodology
3. Data Analysis
4. Findings
5. Conclusions
6. Recommendations
7. Appendices

## 1. Introduction
### Purpose
[Explain the purpose and objectives of this report]

### Scope
[Define what is included and excluded from this report]

### Background
[Provide relevant background information and context]

## 2. Methodology
### Data Collection
[Describe how data was collected]

### Analysis Methods
[Explain the analytical approaches used]

### Limitations
[Acknowledge any limitations in the methodology]

## 3. Data Analysis
### Key Metrics
- **Metric 1:** [Value and interpretation]
- **Metric 2:** [Value and interpretation]
- **Metric 3:** [Value and interpretation]

### Trends and Patterns
[Describe significant trends observed in the data]

### Comparative Analysis
[Compare current data with historical data or benchmarks]

## 4. Findings
### Major Findings
1. [Finding 1 with supporting evidence]
2. [Finding 2 with supporting evidence]
3. [Finding 3 with supporting evidence]

### Supporting Evidence
[Present charts, graphs, and data tables]

### Analysis Summary
[Summarize what the findings mean]

## 5. Conclusions
### Key Takeaways
- [Conclusion 1]
- [Conclusion 2]
- [Conclusion 3]

### Implications
[Discuss the implications of these conclusions]

## 6. Recommendations
### Immediate Actions
1. [Recommendation 1 with timeline]
2. [Recommendation 2 with timeline]

### Long-term Strategies
1. [Strategy 1 with implementation plan]
2. [Strategy 2 with implementation plan]

### Resource Requirements
[Detail the resources needed to implement recommendations]

## 7. Next Steps
- [Next step 1]
- [Next step 2]
- [Next step 3]

## 8. Appendices
### Appendix A: Raw Data
[Include raw data tables]

### Appendix B: Detailed Charts
[Include detailed visualizations]

### Appendix C: Supporting Documents
[Include any supporting documentation]`,
        layout: 'single-column',
        fields: [
          { id: Date.now() + 1, label: 'Report Title', type: 'text', required: true, placeholder: 'Enter comprehensive report title', options: [] },
          { id: Date.now() + 2, label: 'Author', type: 'text', required: true, placeholder: 'Enter author name', options: [] },
          { id: Date.now() + 3, label: 'Report Date', type: 'date', required: true, placeholder: '', options: [] },
          { id: Date.now() + 4, label: 'Report Period', type: 'text', required: true, placeholder: 'e.g., Q1 2024, Academic Year 2023-24', options: [] },
          { id: Date.now() + 5, label: 'Target Audience', type: 'select', required: true, placeholder: '', options: ['Administration', 'Teachers', 'Parents', 'Students', 'School Board', 'General Public'] },
          { id: Date.now() + 6, label: 'Report Purpose', type: 'textarea', required: true, placeholder: 'Explain the purpose and objectives of this report', options: [] },
          { id: Date.now() + 7, label: 'Scope and Background', type: 'textarea', required: true, placeholder: 'Define scope and provide background context', options: [] },
          { id: Date.now() + 8, label: 'Methodology', type: 'textarea', required: true, placeholder: 'Describe data collection and analysis methods', options: [] },
          { id: Date.now() + 9, label: 'Key Metric 1', type: 'text', required: true, placeholder: 'Enter first key metric', options: [] },
          { id: Date.now() + 10, label: 'Key Metric 2', type: 'text', required: false, placeholder: 'Enter second key metric', options: [] },
          { id: Date.now() + 11, label: 'Key Metric 3', type: 'text', required: false, placeholder: 'Enter third key metric', options: [] },
          { id: Date.now() + 12, label: 'Major Finding 1', type: 'textarea', required: true, placeholder: 'Describe first major finding with evidence', options: [] },
          { id: Date.now() + 13, label: 'Major Finding 2', type: 'textarea', required: false, placeholder: 'Describe second major finding with evidence', options: [] },
          { id: Date.now() + 14, label: 'Primary Recommendation', type: 'textarea', required: true, placeholder: 'Enter primary recommendation with timeline', options: [] },
          { id: Date.now() + 15, label: 'Implementation Timeline', type: 'select', required: true, placeholder: '', options: ['Immediate (1-2 weeks)', 'Short-term (1-3 months)', 'Medium-term (3-6 months)', 'Long-term (6+ months)'] },
          { id: Date.now() + 16, label: 'Resource Requirements', type: 'textarea', required: true, placeholder: 'Detail resources needed for implementation', options: [] }
        ]
      },
      'ultimate': {
        name: 'Ultimate Educational Template',
        description: 'A comprehensive all-in-one educational template combining lesson planning, assessment, worksheets, and reporting capabilities.',
        category: 'lesson-plan',
        content: `# Ultimate Educational Template

## Template Overview
This comprehensive template combines lesson planning, assessment design, worksheet creation, and reporting capabilities in one unified document.

---

## SECTION 1: LESSON PLANNING

### Basic Lesson Information
- **Subject:** [Enter Subject]
- **Unit/Topic:** [Enter Unit]
- **Grade Level:** [Enter Grade]
- **Duration:** [Enter Duration]
- **Date:** [Enter Date]

### Learning Objectives
By the end of this lesson, students will be able to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

### Standards Alignment
- [Standard 1]
- [Standard 2]
- [Standard 3]

### Materials and Resources
- [Material 1]
- [Material 2]
- [Technology requirements]

### Lesson Structure
#### Opening (10 minutes)
- Hook/Attention grabber
- Connect to prior learning
- State learning objectives

#### Main Activity (30 minutes)
- Detailed activity description
- Student engagement strategies
- Differentiation notes

#### Assessment (10 minutes)
- Formative assessment strategy
- Success criteria

#### Closure (5 minutes)
- Summary and reflection

---

## SECTION 2: ASSESSMENT DESIGN

### Assessment Overview
- **Assessment Type:** [Formative/Summative]
- **Total Points:** [Enter Points]
- **Assessment Method:** [Enter Method]

### Rubric Criteria
#### Criteria 1: [Name]
- Excellent (4): [Description]
- Proficient (3): [Description]
- Developing (2): [Description]
- Beginning (1): [Description]

#### Criteria 2: [Name]
- Excellent (4): [Description]
- Proficient (3): [Description]
- Developing (2): [Description]
- Beginning (1): [Description]

### Assessment Questions
1. [Question 1]
2. [Question 2]
3. [Question 3]

### Answer Key and Explanations
[Provide detailed answer key]

---

## SECTION 3: STUDENT WORKSHEET

### Worksheet Instructions
1. [Instruction 1]
2. [Instruction 2]
3. [Instruction 3]

### Practice Problems
#### Section A: Knowledge Check
1. [Question 1]
2. [Question 2]

#### Section B: Application
1. [Problem 1]
2. [Problem 2]

#### Section C: Analysis
1. [Analysis question 1]
2. [Analysis question 2]

### Extension Activities
- [Extension 1]
- [Extension 2]

---

## SECTION 4: DATA COLLECTION & REPORTING

### Student Performance Data
- **Class Average:** ____%
- **Mastery Rate:** ____%
- **Areas of Strength:** [List areas]
- **Areas for Improvement:** [List areas]

### Individual Student Tracking
| Student Name | Score | Mastery Level | Notes |
|--------------|-------|---------------|-------|
| [Student 1]  | ___   | ___          | ___   |
| [Student 2]  | ___   | ___          | ___   |

### Reflection and Next Steps
#### What Worked Well
- [Success 1]
- [Success 2]

#### Areas for Improvement
- [Improvement 1]
- [Improvement 2]

#### Next Lesson Adaptations
- [Adaptation 1]
- [Adaptation 2]

---

## SECTION 5: PARENT COMMUNICATION

### Progress Summary
[Brief summary of student progress for parent communication]

### Home Support Suggestions
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]

### Resources for Home
- [Resource 1]
- [Resource 2]

---

## SECTION 6: PROFESSIONAL DEVELOPMENT NOTES

### Teaching Strategies Used
- [Strategy 1]
- [Strategy 2]

### Student Engagement Observations
- [Observation 1]
- [Observation 2]

### Professional Growth Goals
- [Goal 1]
- [Goal 2]

---

## APPENDICES

### Appendix A: Supporting Materials
[List and attach supporting materials]

### Appendix B: Technology Integration
[Document technology tools and integration strategies]

### Appendix C: Differentiation Strategies
[Detail specific accommodations and modifications]`,
        layout: 'single-column',
        fields: [
          { id: Date.now() + 1, label: 'Subject', type: 'text', required: true, placeholder: 'Enter subject name', options: [] },
          { id: Date.now() + 2, label: 'Unit/Topic', type: 'text', required: true, placeholder: 'Enter unit or topic', options: [] },
          { id: Date.now() + 3, label: 'Grade Level', type: 'select', required: true, placeholder: '', options: ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'] },
          { id: Date.now() + 4, label: 'Lesson Duration', type: 'select', required: true, placeholder: '', options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes'] },
          { id: Date.now() + 5, label: 'Learning Objective 1', type: 'textarea', required: true, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 6, label: 'Learning Objective 2', type: 'textarea', required: false, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 7, label: 'Learning Objective 3', type: 'textarea', required: false, placeholder: 'Students will be able to...', options: [] },
          { id: Date.now() + 8, label: 'Standards Alignment', type: 'textarea', required: true, placeholder: 'List relevant educational standards', options: [] },
          { id: Date.now() + 9, label: 'Required Materials', type: 'textarea', required: true, placeholder: 'List all materials and resources needed', options: [] },
          { id: Date.now() + 10, label: 'Opening Activity', type: 'textarea', required: true, placeholder: 'Describe the hook or attention grabber', options: [] },
          { id: Date.now() + 11, label: 'Main Learning Activity', type: 'textarea', required: true, placeholder: 'Detailed description of main activity', options: [] },
          { id: Date.now() + 12, label: 'Assessment Type', type: 'select', required: true, placeholder: '', options: ['Formative Assessment', 'Summative Assessment', 'Diagnostic Assessment', 'Performance Assessment'] },
          { id: Date.now() + 13, label: 'Assessment Criteria 1', type: 'text', required: true, placeholder: 'Enter first assessment criteria', options: [] },
          { id: Date.now() + 14, label: 'Assessment Criteria 2', type: 'text', required: false, placeholder: 'Enter second assessment criteria', options: [] },
          { id: Date.now() + 15, label: 'Practice Question 1', type: 'textarea', required: true, placeholder: 'Enter practice question for worksheet', options: [] },
          { id: Date.now() + 16, label: 'Practice Question 2', type: 'textarea', required: false, placeholder: 'Enter practice question for worksheet', options: [] },
          { id: Date.now() + 17, label: 'Analysis Question', type: 'textarea', required: false, placeholder: 'Enter higher-order thinking question', options: [] },
          { id: Date.now() + 18, label: 'Extension Activities', type: 'textarea', required: false, placeholder: 'Activities for advanced learners', options: [] },
          { id: Date.now() + 19, label: 'Differentiation Strategies', type: 'textarea', required: true, placeholder: 'How will you adapt for different learners?', options: [] },
          { id: Date.now() + 20, label: 'Home Support Suggestions', type: 'textarea', required: false, placeholder: 'Suggestions for parents to support learning at home', options: [] },
          { id: Date.now() + 21, label: 'Teaching Strategy Used', type: 'select', required: false, placeholder: '', options: ['Direct Instruction', 'Collaborative Learning', 'Inquiry-Based Learning', 'Project-Based Learning', 'Flipped Classroom', 'Differentiated Instruction'] },
          { id: Date.now() + 22, label: 'Technology Integration', type: 'textarea', required: false, placeholder: 'Describe technology tools and integration', options: [] },
          { id: Date.now() + 23, label: 'Lesson Reflection', type: 'textarea', required: false, placeholder: 'Post-lesson reflection and next steps', options: [] }
        ]
      }
    }

    const templateConfig = templates[templateType]
    if (!templateConfig) {
      toast.error('Template type not found')
      return
    }

    try {
      const newTemplate = await templateService.create(templateConfig)
      setTemplates(prev => [...prev, newTemplate])
      setShowGenerateModal(false)
      toast.success(`${templateConfig.name} generated successfully! You can now edit and customize it.`)
    } catch (err) {
      toast.error('Failed to generate template')
      console.error('Error generating template:', err)
    }
  }

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
            variant="outline"
            icon="Wand2"
            onClick={handleGenerateCompleteTemplate}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100"
          >
            Generate Complete Template
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
{(formData.fields || []).filter(field => field && field.id).map((field, index) => (
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

      {/* Generate Complete Template Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Generate Complete Template</h2>
              <p className="text-sm text-gray-600">
                Choose a category to generate a comprehensive template with pre-configured fields and sample content
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completeTemplateOptions.map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => generateCompleteTemplate(option.value)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${option.color}`}>
                        <ApperIcon name={option.icon} size={20} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{option.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {option.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                    <ApperIcon name="Sparkles" size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Ultimate Complete Template</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Generate a comprehensive template with sections for all educational purposes - lesson planning, assessment, worksheets, and reporting combined.
                </p>
                <Button
                  variant="primary"
                  icon="Zap"
                  onClick={() => generateCompleteTemplate('ultimate')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Generate Ultimate Template
                </Button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TemplatesPage