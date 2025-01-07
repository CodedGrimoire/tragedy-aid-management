'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import SearchBar from '@/components/SearchBar'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function FamiliesPage() {
  const [families, setFamilies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/families')
      .then(res => res.json())
      .then(data => {
        setFamilies(data)
        setLoading(false)
      })
  }, [])

  const filteredFamilies = families.filter(family =>
    family.headName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const chartData = [
    { name: 'With Recipients', value: families.filter(f => f.recipient).length },
    { name: 'Without Recipients', value: families.filter(f => !f.recipient).length },
  ]

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Families</h1>
        <SearchBar
          placeholder="Search families..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Families List */}
      <div className="grid gap-4">
        {filteredFamilies.map(family => (
          <div key={family.familyID} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium">{family.headName}</h2>
            <p className="text-gray-600">Contact: {family.contact}</p>
            <p className="text-gray-600">Address: {family.address}</p>
            <p className="text-gray-600">
              Victims: {family.victims?.length || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}