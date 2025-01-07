export default function EventsOverview() {
  const events = [
    {
      id: 1,
      name: 'Flood in District A',
      location: 'District A',
      date: '2024-01-15',
      victims: 150,
    },
    {
      id: 2,
      name: 'Fire in Building B',
      location: 'City B',
      date: '2024-01-10',
      victims: 45,
    },
    {
      id: 3,
      name: 'Landslide in Region C',
      location: 'Region C',
      date: '2024-01-05',
      victims: 89,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Events Overview</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{event.name}</h4>
                <p className="text-sm text-gray-500">
                  {event.location} • {event.date}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {event.victims} victims
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            View all events
          </button>
        </div>
      </div>
    </div>
  )
}