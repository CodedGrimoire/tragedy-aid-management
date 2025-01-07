const iconMap = {
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  alert: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
}

const typeStyles = {
  emergency: 'bg-emergency-50 text-emaergency-700',
  warning: 'bg-yellow-50 text-yellow-700',
  success: 'bg-green-50 text-green-700',
}

export default function StatCard({ title, subtitle, value, icon, type = 'default', loading = false }) {
  return (
    <div className={`rounded-lg shadow p-6 ${typeStyles[type] || 'bg-white'}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${type === 'emergency' ? 'bg-emergency-100' : type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`}>
          {iconMap[icon]}
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm opacity-75">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </div>
    </div>
  )
}
