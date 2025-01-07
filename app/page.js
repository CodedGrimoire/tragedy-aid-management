'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import EventsList from '@/components/EventsList'
import VictimsSummary from '@/components/VictimsSummary'
import EmergencyStats from '@/components/EmergencyStats'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalVictims: 0,
    activeEvents: 0,
    supportedFamilies: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch statistics')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tragic Events Monitoring</h1>
            <p className="mt-2 text-gray-600">Track and manage assistance for victims of tragic incidents</p>
          </div>

          <EmergencyStats stats={stats} loading={loading} />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <EventsList />
            </div>
            <div>
              <VictimsSummary onVictimAdded={fetchStats} />
            </div>
          </div>
          
        </main>
      </div>
    </div>
  )
}