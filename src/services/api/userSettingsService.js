import userSettingsData from '@/services/mockData/userSettings.json'

class UserSettingsService {
  constructor() {
    this.data = [...userSettingsData]
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
}

export const userSettingsService = new UserSettingsService()