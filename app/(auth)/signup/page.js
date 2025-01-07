'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Add your signup logic here
    console.log('Signup attempt:', formData)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center" 
           style={{ 
             backgroundImage: "url('https://images.unsplash.com/photo-1579451861283-a2239070aaa9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80')",
           }}>
        <div className="flex items-center h-full w-full bg-gray-900 bg-opacity-40">
          <div className="text-white px-20">
            <h1 className="text-5xl font-bold mb-6">Join Us Today</h1>
            <p className="text-lg">Create an account and start making a difference in people's lives.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us in our mission to help those in need</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition duration-200"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition duration-200"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition duration-200"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition duration-200"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}