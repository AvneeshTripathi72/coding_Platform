import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { LayoutSettingsProvider } from '../context/LayoutSettingsContext.jsx'

function UserLayout(){
  return (
    <LayoutSettingsProvider>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="w-full px-8 mt-4">
          <main className="pb-10">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutSettingsProvider>
  )
}

export default UserLayout
