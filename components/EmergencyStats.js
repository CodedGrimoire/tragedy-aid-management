export default function EmergencyStats({ stats, loading }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-tragic-50 rounded-lg p-6 border border-tragic-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-tragic-100">
              <svg className="h-6 w-6 text-tragic-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-tragic-900">Total Victims</h2>
              <p className="mt-1 text-3xl font-semibold text-tragic-700">
                {loading ? '...' : stats.totalVictims}
              </p>
            </div>
          </div>
        </div>
  
        <div className="bg-support-50 rounded-lg p-6 border border-support-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-support-100">
              <svg className="h-6 w-6 text-support-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-support-900">Families Assisted</h2>
              <p className="mt-1 text-3xl font-semibold text-support-700">
                {loading ? '...' : stats.supportedFamilies}
              </p>
            </div>
          </div>
        </div>
  
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Active Events</h2>
              <p className="mt-1 text-3xl font-semibold text-gray-700">
                {loading ? '...' : stats.activeEvents}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }