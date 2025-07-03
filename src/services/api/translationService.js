const availableLanguages = [
  { code: 'English', label: 'English', nativeLabel: 'English' },
  { code: 'Malay', label: 'Bahasa Melayu', nativeLabel: 'Bahasa Melayu' },
  { code: 'Chinese', label: '中文', nativeLabel: '中文' },
  { code: 'Arabic', label: 'فاهاك', nativeLabel: 'فاهاك' }
]

// Basic translations for common UI elements
const translations = {
  English: {
    welcome: 'Welcome',
    settings: 'Settings',
    language: 'Language',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success'
  },
  Malay: {
    welcome: 'Selamat datang',
    settings: 'Tetapan',
    language: 'Bahasa',
    save: 'Simpan',
    cancel: 'Batal',
    loading: 'Memuatkan...',
    error: 'Ralat',
    success: 'Berjaya'
  },
  Chinese: {
    welcome: '欢迎',
    settings: '设置',
    language: '语言',
    save: '保存',
    cancel: '取消',
    loading: '加载中...',
    error: '错误',
    success: '成功'
  },
  Arabic: {
    welcome: 'مرحبا',
    settings: 'الإعدادات',
    language: 'اللغة',
    save: 'حفظ',
    cancel: 'إلغاء',
    loading: 'جار التحميل...',
    error: 'خطأ',
    success: 'نجح'
  }
}

export const translationService = {
  getAvailableLanguages: () => {
    return availableLanguages
  },

  getTranslations: async (languageCode) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return translations[languageCode] || translations.English
  }
}