'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Signup failed');
        return;
      }

      // ✅ Store token in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      alert('Signup successful! Redirecting...');
      router.push('/'); // ✅ Redirect to home page
    } catch (error) {
      console.error('Signup error:', error);
      alert('Something went wrong, please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div 
        className="hidden lg:flex w-1/2 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/back_our/20190628/ourmid/pngtree-beautiful-red-aids-illustration-background-image_279830.jpg')", 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex items-center h-full w-full bg-gray-900 bg-opacity-40 text-white px-20">
          <div>
            <h1 className="text-5xl font-bold mb-6">Welcome to Our Tragedy Aid Management Website</h1>
            <p className="text-lg">
              Our website is dedicated to providing assistance and support to individuals and families impacted by tragic events. Join us today to make a difference and help those in need.
            </p>
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
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300"
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
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300"
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
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300"
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
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Admin Code</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300"
                placeholder="Enter admin code"
                value={formData.adminCode}
                onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
              />
            </div>

            <button type="submit" className="w-full py-3 text-white bg-red-600 hover:bg-red-700 rounded-full">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
