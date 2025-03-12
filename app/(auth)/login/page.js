'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      // Store JWT token in localStorage
      localStorage.setItem('auth_token', data.token);

      alert('Login successful! Redirecting...');
      router.push('/'); // Redirect to the home page after login

    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong, please try again.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/back_our/20190628/ourmid/pngtree-beautiful-red-aids-illustration-background-image_279830.jpg')", // Background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white bg-opacity-60 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Sign In</h1>
          <p className="text-gray-600">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-full bg-gray-100 border border-red-500"
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
              className="w-full px-4 py-3 rounded-full bg-gray-100 border border-red-500"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white bg-red-600 hover:bg-red-700 rounded-full"
          >
            Sign in
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-red-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
