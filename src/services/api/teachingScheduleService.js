import teachingSchedulesData from '@/services/mockData/teachingSchedules.json'

class TeachingScheduleService {
  constructor() {
    this.data = [...teachingSchedulesData]
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
      Id: newId
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
    throw new Error('Teaching schedule not found')
  }

  async delete(id) {
    await this.delay()
    const index = this.data.findIndex(item => item.Id === parseInt(id))
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Teaching schedule not found')
  }

  async getByClass(classId) {
    await this.delay()
    return this.data.filter(item => item.classId === parseInt(classId))
  }

  async getBySubject(subjectId) {
    await this.delay()
    return this.data.filter(item => item.subjectId === parseInt(subjectId))
  }

async getByDay(dayOfWeek) {
    await this.delay()
    return this.data.filter(item => item.dayOfWeek === dayOfWeek)
  }

  async getByLevel(level, classesData) {
    await this.delay()
    const levelClassIds = classesData
      .filter(cls => cls.level === level)
      .map(cls => cls.Id)
    return this.data.filter(item => levelClassIds.includes(item.classId))
  }
}

export const teachingScheduleService = new TeachingScheduleService()