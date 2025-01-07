// components/Navbar.js
import Logo from './Logo'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-full mx-4 px-4">
        <div className="flex justify-between h-20"> {/* Increased height from h-16 to h-20 */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center pl-3"> {/* Increased left padding */}
              <Logo />
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 pr-4">
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Contact Us
            </Link>
            <Link 
              href="/login" 
              className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}