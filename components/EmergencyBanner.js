export default function EmergencyBanner() {
    return (
      <div className="bg-emergency-600 text-white px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Emergency Response Active</span>
          </div>
          <div className="text-sm">
            Emergency Hotline: <span className="font-bold">999</span>
          </div>
        </div>
      </div>
    )
  }