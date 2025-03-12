'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default center (Dhaka, Bangladesh)
const defaultCenter = {
  lat: 23.8103,
  lng: 90.4125,
};

// Map style options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [victims, setVictims] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVictim, setSelectedVictim] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [viewport, setViewport] = useState('desktop');
  const [error, setError] = useState(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  // Fetch events and victims data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch events
        const eventsResponse = await fetch('/api/events');
        if (!eventsResponse.ok) throw new Error('Failed to fetch events');
        const eventsData = await eventsResponse.json();
        
        // Fetch victims
        const victimsResponse = await fetch('/api/victim');
        if (!victimsResponse.ok) throw new Error('Failed to fetch victims');
        const victimsData = await victimsResponse.json();
        
        setEvents(eventsData);
        setVictims(victimsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check viewport size for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewport('mobile');
      } else if (window.innerWidth < 1024) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter events based on search term and filter type
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesFilter = 
        filterType === 'All' || 
        event.type === filterType;
        
      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filterType]);

  // Get victims for a specific event
  const getEventVictims = (eventId) => {
    return victims.filter(victim => 
      victim.event && victim.event.eventID === eventId
    );
  };

  // Handle event selection
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedVictim(null);
    setShowInfoWindow(false);
    
    if (event.lat && event.lng) {
      setMapCenter({ lat: event.lat, lng: event.lng });
    }
    
    // On mobile, automatically collapse the sidebar
    if (viewport === 'mobile') {
      const sidebar = document.getElementById('eventsSidebar');
      if (sidebar) sidebar.classList.add('collapsed');
    }
  };

  // Handle marker click
  const handleMarkerClick = (event) => {
    setSelectedEvent(event);
    setShowInfoWindow(true);
  };

  // Get marker color based on event type or severity
  const getMarkerIcon = (event) => {
    // You can replace these with actual SVG icons for better visuals
    const defaultIcon = {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
      fillColor: '#E53E3E', // Default red color
      fillOpacity: 0.9,
      strokeWeight: 1,
      strokeColor: '#FFFFFF',
      scale: 1.5,
      anchor: { x: 12, y: 24 },
    };
    
    // Customize based on event type
    switch(event.type) {
      case 'Natural Disaster':
        defaultIcon.fillColor = '#D69E2E'; // Yellow
        break;
      case 'Accident':
        defaultIcon.fillColor = '#E53E3E'; // Red
        break;
      case 'Civil Unrest':
        defaultIcon.fillColor = '#805AD5'; // Purple
        break;
      default:
        defaultIcon.fillColor = '#3182CE'; // Blue
    }
    
    return defaultIcon;
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    const sidebar = document.getElementById('eventsSidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  };

  // Loading state components
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-5">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Events</h2>
          <p className="text-gray-600">Gathering disaster and emergency event data...</p>
          
          {/* Skeleton loading items */}
          <div className="mt-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error loading data: {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Maps loading error
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="inline-block p-4 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Maps Failed to Load</h2>
          <p className="text-gray-600 mb-6">There was a problem loading Google Maps. Please check your internet connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-5">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Maps</h2>
          <p className="text-gray-600">Preparing interactive map interface...</p>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-md z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Disaster Events Map</h1>
          
          {/* Mobile toggle button */}
          <button 
            className="md:hidden bg-red-700 p-2 rounded-md"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Event List */}
        <div 
          id="eventsSidebar"
          className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 overflow-y-auto shadow-md transition-all duration-300 ease-in-out z-20"
          style={{ maxHeight: 'calc(100vh - 64px)' }} // Adjust based on header height
        >
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-red-600 mb-2">Events List</h2>
              <p className="text-gray-600 text-sm mb-4">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Search and filter */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 text-black"
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white text-black"
              >
                <option value="All">All Event Types</option>
                <option value="Natural Disaster">Natural Disaster</option>
                <option value="Accident">Accident</option>
                <option value="Civil Unrest">Civil Unrest</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Events list */}
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600">No events match your search criteria</p>
                </div>
              ) : (
                filteredEvents.map(event => {
                  const eventVictims = getEventVictims(event.eventID);
                  return (
                    <div
                      key={event.eventID}
                      onClick={() => handleEventClick(event)}
                      className={`
                        p-4 rounded-lg cursor-pointer border transition-all duration-200
                        ${selectedEvent?.eventID === event.eventID 
                          ? 'bg-red-50 border-red-500 shadow-md' 
                          : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-300'}
                      `}
                    >
                      <h3 className="text-lg font-bold text-gray-900">{event.description}</h3>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700">{event.location}</span>
                        </div>
                        
                        {event.date && (
                          <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700">
                              {format(new Date(event.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Victim count badge */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-700">
                            {eventVictims.length || 0} victim{eventVictims.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {event.type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {event.type}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={selectedEvent ? 15 : 8}
            center={mapCenter}
            options={mapOptions}
          >
            {filteredEvents.map(event => (
              <Marker
                key={event.eventID}
                position={{ lat: event.lat, lng: event.lng }}
                onClick={() => handleMarkerClick(event)}
                icon={getMarkerIcon(event)}
                animation={selectedEvent?.eventID === event.eventID ? window.google.maps.Animation.BOUNCE : null}
              />
            ))}

            {/* Info Window for selected event */}
            {showInfoWindow && selectedEvent && (
              <InfoWindow
                position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <div className="p-2 max-w-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedEvent.description}</h3>
                  <p className="text-gray-700 mb-2">{selectedEvent.location}</p>
                  
                  {selectedEvent.date && (
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Date:</span> {format(new Date(selectedEvent.date), 'PPP')}
                    </p>
                  )}
                  
                  {/* Victim List */}
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900 mb-1">Victims:</h4>
                    <div className="max-h-48 overflow-y-auto">
                      {getEventVictims(selectedEvent.eventID).length > 0 ? (
                        getEventVictims(selectedEvent.eventID).map(victim => (
                          <div 
                            key={victim.birthCertificateNumber}
                            className="p-2 bg-gray-50 rounded mb-2 border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedVictim(victim)}
                          >
                            <p className="font-medium text-gray-900">{victim.name}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-sm text-gray-600">ID: {victim.birthCertificateNumber}</p>
                              {victim.status && (
                                <span className={`
                                  text-xs px-2 py-1 rounded-full
                                  ${victim.status === 'Missing' ? 'bg-yellow-100 text-yellow-800' : 
                                    victim.status === 'Deceased' ? 'bg-gray-100 text-gray-800' : 
                                    victim.status === 'Injured' ? 'bg-orange-100 text-orange-800' : 
                                    victim.status === 'Found' ? 'bg-green-100 text-green-800' : 
                                    'bg-blue-100 text-blue-800'}
                                `}>
                                  {victim.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-sm">No victim records available</p>
                      )}
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Victim details overlay */}
          {selectedVictim && (
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg max-w-sm w-full border border-gray-200 p-4 z-10">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900">{selectedVictim.name}</h3>
                <button 
                  onClick={() => setSelectedVictim(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">ID:</span> {selectedVictim.birthCertificateNumber}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Gender:</span> {
                      selectedVictim.gender === 'M' ? 'Male' : 
                      selectedVictim.gender === 'F' ? 'Female' : 'Other'
                    }
                  </p>
                  {selectedVictim.status && (
                    <p>
                      <span className="font-medium text-gray-700">Status:</span>{' '}
                      <span className={`
                        px-2 py-1 rounded-full text-sm
                        ${selectedVictim.status === 'Missing' ? 'bg-yellow-100 text-yellow-800' : 
                          selectedVictim.status === 'Deceased' ? 'bg-gray-100 text-gray-800' : 
                          selectedVictim.status === 'Injured' ? 'bg-orange-100 text-orange-800' : 
                          selectedVictim.status === 'Found' ? 'bg-green-100 text-green-800' : 
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {selectedVictim.status}
                      </span>
                    </p>
                  )}
                </div>
                
                {selectedVictim.medical && (
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-1">Medical Info</h4>
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Blood Group:</span> {selectedVictim.medical.bloodGroup || 'N/A'}
                    </p>
                    {selectedVictim.medical.medicalCondition && (
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Condition:</span> {selectedVictim.medical.medicalCondition}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {selectedVictim.family && (
                <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-1">Family Contact</h4>
                  <p className="text-gray-700 text-sm">{selectedVictim.family.headName}</p>
                  {selectedVictim.family.contact && (
                    <p className="text-gray-700 text-sm">{selectedVictim.family.contact}</p>
                  )}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => router.push(`/victim/${selectedVictim.birthCertificateNumber}`)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm transition-colors duration-200 text-sm"
                >
                  View Full Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}