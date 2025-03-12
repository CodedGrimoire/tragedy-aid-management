import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { AuthProvider } from '../context/authcontext';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
        <AuthProvider>
          {children}
        </AuthProvider>

        </main>
      </div>
    </div>
  )
}

