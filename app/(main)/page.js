'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EventsList from '@/components/EventsList'
import VictimsSummary from '@/components/VictimsSummary'
import EmergencyStats from '@/components/EmergencyStats'

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalVictims: 0,
    activeEvents: 0,
    supportedFamilies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Step 1: Check authentication but don't redirect
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No token found, proceeding without authentication');
        return; // Allow user to stay on the dashboard
      }

      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Invalid session, but no redirection enforced.');
          localStorage.removeItem('auth_token');
        } else {
          setIsAuthenticated(true);
          console.log('User authenticated successfully');
        }
      } catch (error) {
        console.error('Error verifying user:', error);
      }
    };

    checkAuth();
  }, []);

  // ✅ Step 2: Fetch statistics when user is authenticated
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="mb-10"> {/* Increased margin for spacing */}
            <h1 className="text-3xl font-bold text-gray-900">Tragic Events Monitoring</h1>
            <p className="mt-2 text-gray-600">Track and manage assistance for victims of tragic incidents</p>
          </div>

          {/* ✅ Increased spacing for Emergency Stats */}
          <div className="mb-14">
            <EmergencyStats stats={stats} loading={loading} />
          </div>

          {/* ✅ Adjusted spacing for Event List & Victims Summary */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* ✅ Wrap event names properly and prevent overlap */}
              <div className="min-h-[400px] overflow-auto">
                <EventsList className="break-words whitespace-normal py-3 min-h-[80px]" />
              </div>
            </div>
            <div>
              <VictimsSummary onVictimAdded={fetchStats} />
            </div>
          </div>
        </main>
      </div>

      {/* ✅ Live Date and Time */}
      <div className="absolute top-20 right-4 text-sm font-normal text-gray-900 bg-opacity-70 bg-white p-2 rounded-lg shadow-md">
        {currentTime.split(",")[0]}<br />
        {currentTime.split(",")[1]}
      </div>
    </div>
  );
}
