'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SearchBar from '@/components/SearchBar'

export default function NGOsPage() {
  const [ngos, setNGOs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ngos')
      .then(res => res.json())
      .then(data => {
        setNGOs(data)
        setLoading(false)
      })
  }, [])

  const filteredNGOs = ngos.filter(ngo =>
    ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.supportType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const chartData = ngos.map(ngo => ({
    name: ngo.name,
    services: ngo.servicesProvided?.length || 0,
  }))

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">NGOs</h1>
        <SearchBar
          placeholder="Search NGOs..."
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
            <Bar dataKey="services" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* NGOs List */}
      <div className="grid gap-4">
        {filteredNGOs.map(ngo => (
          <div key={ngo.ngoID} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium">{ngo.name}</h2>
            <p className="text-gray-600">Contact: {ngo.contact}</p>
            <p className="text-gray-600">Support Type: {ngo.supportType}</p>
            <p className="text-gray-600">
              Services Provided: {ngo.servicesProvided?.length || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}