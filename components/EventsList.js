'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EventsList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) throw new Error('Failed to fetch events')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Recent Tragic Events</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {events.map((event) => (
          <Link 
            key={event.eventID} 
            href={`/events/${event.eventID}`}
            className="block hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-tragic-700">
                    {event.description}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-tragic-100 text-tragic-800">
                    {event.victims?.length || 0} victims
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-support-600">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  View details and manage assistance
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}