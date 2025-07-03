class GoogleDriveService {
  constructor() {
    this.connected = false
    this.userEmail = ''
    this.accessToken = ''
  }

  async delay(ms = 400) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getConnectionStatus() {
    await this.delay()
    
    // Simulate checking stored connection
    const storedConnection = localStorage.getItem('googleDriveConnection')
    if (storedConnection) {
      const connectionData = JSON.parse(storedConnection)
      this.connected = connectionData.connected
      this.userEmail = connectionData.userEmail
      this.accessToken = connectionData.accessToken
      
      return {
        connected: this.connected,
        userEmail: this.userEmail,
        connectedAt: connectionData.connectedAt
      }
    }
    
    return {
      connected: false,
      userEmail: '',
      connectedAt: null
    }
  }

  async connect() {
    await this.delay(2000) // Simulate OAuth flow time

    // Simulate successful OAuth flow
    const mockUserEmail = 'teacher@school.edu.my'
    const mockAccessToken = 'mock_access_token_' + Date.now()
    
    this.connected = true
    this.userEmail = mockUserEmail
    this.accessToken = mockAccessToken

    // Store connection data
    const connectionData = {
      connected: true,
      userEmail: mockUserEmail,
      accessToken: mockAccessToken,
      connectedAt: new Date().toISOString()
    }
    
    localStorage.setItem('googleDriveConnection', JSON.stringify(connectionData))

    return {
      success: true,
      userEmail: mockUserEmail,
      accessToken: mockAccessToken
    }
  }

  async disconnect() {
    await this.delay()

    this.connected = false
    this.userEmail = ''
    this.accessToken = ''

    // Remove stored connection
    localStorage.removeItem('googleDriveConnection')

    return { success: true }
  }

  async exportFile(file) {
    await this.delay(1500) // Simulate upload time

    if (!this.connected) {
      throw new Error('Google Drive not connected')
    }

    // Simulate file export
    const exportedFile = {
      id: 'mock_drive_file_' + Date.now(),
      name: file.fileName,
      url: `https://drive.google.com/file/d/mock_id_${file.Id}/view`,
      exportedAt: new Date().toISOString(),
      size: '2.4 MB'
    }

    return {
      success: true,
      file: exportedFile,
      driveUrl: exportedFile.url
    }
  }

  async createFolder(name) {
    await this.delay()

    if (!this.connected) {
      throw new Error('Google Drive not connected')
    }

    return {
      success: true,
      folder: {
        id: 'mock_folder_' + Date.now(),
        name: name,
        url: `https://drive.google.com/drive/folders/mock_folder_id`
      }
    }
  }

  async listFiles() {
    await this.delay()

    if (!this.connected) {
      throw new Error('Google Drive not connected')
    }

    // Simulate file listing
    return {
      success: true,
      files: [
        {
          id: 'mock_file_1',
          name: 'Lesson Plan - Mathematics.docx',
          size: '1.2 MB',
          modifiedTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock_file_2',
          name: 'Science Lesson Template.docx',
          size: '0.8 MB',
          modifiedTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  }
}

export const googleDriveService = new GoogleDriveService()