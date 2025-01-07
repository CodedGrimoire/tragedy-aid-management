'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import SearchBar from '@/components/SearchBar'
import { format } from 'date-fns'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function MedicalPage() {
  const [medicalRecords, setMedicalRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/medical')
      .then(res => res.json())
      .then(data => {
        setMedicalRecords(data)
        setLoading(false)
      })
  }, [])

  const filteredRecords = medicalRecords.filter(record =>
    record.medicalID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const bloodGroupData = Object.entries(
    medicalRecords.reduce((acc, record) => {
      acc[record.bloodGroup || 'Unknown'] = (acc[record.bloodGroup || 'Unknown'] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Medical Records</h1>
        <SearchBar
          placeholder="Search medical records..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={bloodGroupData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {bloodGroupData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Medical Records List */}
      <div className="grid gap-4">
        {filteredRecords.map(record => (
          <div key={record.medicalID} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium">Medical ID: {record.medicalID}</h2>
            <p className="text-gray-600">Blood Group: {record.bloodGroup}</p>
            <p className="text-gray-600">
              Date of Birth: {record.dateOfBirth ? format(new Date(record.dateOfBirth), 'PPP') : 'N/A'}
            </p>
            <p className="text-gray-600">
              Medical Condition: {record.medicalCondition || 'None'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}