import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0 relative transition-all duration-300">
        <Header onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-auto">
          <div className="dynamic-container-padding">
            <div className="dynamic-container-width mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout