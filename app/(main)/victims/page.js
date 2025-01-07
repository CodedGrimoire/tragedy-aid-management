'use client'
import { useState, useEffect } from 'react'

export default function VictimsPage() {
  const [victims, setVictims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVictims = async () => {
      try {
        const response = await fetch('/api/victims')
        if (!response.ok) throw new Error('Failed to fetch victims')
        const data = await response.json()
        setVictims(data.victims || []) // Access the victims array from the response
      } catch (err) {
        console.error('Error fetching victims:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVictims()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Victims</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Victims</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Error loading victims: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Victims</h1>
      {victims.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No victims recorded yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {victims.map(victim => (
            <div 
              key={victim.birthCertificateNumber} 
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{victim.name}</h2>
                  <p className="text-gray-600">ID: {victim.birthCertificateNumber}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-500">
                      Gender: {victim.gender === 'M' ? 'Male' : 'Female'}
                    </p>
                    {victim.event && (
                      <p className="text-sm text-gray-500">
                        Event: {victim.event.description}
                      </p>
                    )}
                    {victim.medical && (
                      <p className="text-sm text-gray-500">
                        Medical ID: {victim.medical.medicalID}
                      </p>
                    )}
                  </div>
                </div>
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
  )
}