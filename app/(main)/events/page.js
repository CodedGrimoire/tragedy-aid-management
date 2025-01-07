'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SearchBar from '@/components/SearchBar'
import { format } from 'date-fns'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data)
        setLoading(false)
      })
  }, [])

  const filteredEvents = events.filter(event =>
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const chartData = events.map(event => ({
    name: event.description,
    victims: event.victims?.length || 0,
  }))

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Events</h1>
        <SearchBar
          placeholder="Search events..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="victims" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {filteredEvents.map(event => (
          <div key={event.eventID} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium">{event.description}</h2>
            <p className="text-gray-600">Location: {event.location}</p>
            <p className="text-gray-600">
              Date: {event.date ? format(new Date(event.date), 'PPP') : 'N/A'}
            </p>
            <p className="text-gray-600">
              Victims: {event.victims?.length || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}