'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RecentVictims() {
  const [victims, setVictims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVictims = async () => {
      try {
        const response = await fetch('/api/victims?limit=5')
        if (!response.ok) throw new Error('Failed to fetch victims')
        const data = await response.json()
        setVictims(data.victims || []) // Access the victims array from the response
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVictims()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Victims</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recent Victims</h3>
        <Link
          href="/victims"
          className="text-sm text-red-600 hover:text-red-800"
        >
          View all
        </Link>
      </div>
      <div className="p-6">
        {victims.length === 0 ? (
          <p className="text-center text-gray-500">No victims recorded yet</p>
        ) : (
          <div className="space-y-4">
            {victims.map((victim) => (
              <div
                key={victim.birthCertificateNumber}
                className="flex items-center space-x-4"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium">
                      {victim.name?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {victim.name}
                  </p>
                  {victim.event && (
                    <p className="text-sm text-gray-500 truncate">
                      {victim.event.description}
                    </p>
                  )}
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      victim.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {victim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}