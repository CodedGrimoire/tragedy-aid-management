'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VictimsPage() {
  const router = useRouter();
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchVictims();
  }, [searchQuery, filterStatus]);

  const fetchVictims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/victim${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch victims');
      const data = await response.json();
      // Assuming the API returns an array directly now
      const victimData = Array.isArray(data) ? data : [];
      
      // Apply status filter if not "All"
      const filteredVictims = filterStatus === 'All' 
        ? victimData 
        : victimData.filter(victim => victim.status === filterStatus);
      
      setVictims(filteredVictims);
    } catch (err) {
      console.error('Error fetching victims:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Missing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Deceased':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Injured':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Found':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Unknown':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const handleAddVictim = () => {
    router.push('/victiminsert');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVictims();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with title and add button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Victim Registry</h1>
          <button
            onClick={handleAddVictim}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 flex items-center"

          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Victim
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, ID, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-black"
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-black"
              >
                <option value="All">All Statuses</option>
                <option value="Missing">Missing</option>
                <option value="Deceased">Deceased</option>
                <option value="Injured">Injured</option>
                <option value="Found">Found</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow transition-colors duration-200"
>
            
              Search
            </button>
          </form>
        </div>

        {/* Content area */}
        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>

              <span className="ml-3 text-gray-700">Loading victims...</span>
            </div>
            <div className="mt-6 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error loading victims: {error}
            </div>
          </div>
        ) : victims.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No victims found</h2>
            <p className="text-gray-600 mb-6">No victims match your current search criteria or no records have been added yet.</p>
            <button
              onClick={handleAddVictim}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Victim
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {victims.map((victim) => (
              <div
                key={victim.birthCertificateNumber}
                className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-red-500"

              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{victim.name}</h2>
                    <p className="text-gray-600">
                      <span className="font-medium">ID:</span> {victim.birthCertificateNumber}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  {victim.status && (
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(victim.status)}`}>
                      {victim.status}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Left column */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-gray-900">
                        <span className="font-medium">Gender:</span> {victim.gender === 'M' ? 'Male' : victim.gender === 'F' ? 'Female' : 'Other'}
                      </p>
                    </div>
                    
                    {victim.event && (
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">Event:</p>
                          <p className="text-gray-700">{victim.event.description}</p>
                          {victim.event.date && (
                            <p className="text-gray-600 text-sm">
                              {new Date(victim.event.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right column - Medical Details */}
                  {victim.medical && (
                   <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">

                      <h3 className="text-blue-800 font-semibold mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Medical Information
                      </h3>
                      <div className="space-y-1 text-gray-900">
                        <p>
                          <span className="font-medium">Medical ID:</span> {victim.medical.medicalID}
                        </p>
                        <p>
                          <span className="font-medium">Blood Group:</span> {victim.medical.bloodGroup || 'N/A'}
                        </p>
                        {victim.medical.medicalCondition && (
                          <p>
                            <span className="font-medium">Condition:</span> {victim.medical.medicalCondition}
                          </p>
                        )}
                        {victim.medical.dateOfBirth && (
                          <p>
                            <span className="font-medium">DOB:</span> {new Date(victim.medical.dateOfBirth).toLocaleDateString()}
                          </p>
                        )}
                        {victim.medical.dateOfDeath && (
                          <p className="text-red-700">
                            <span className="font-medium">Deceased:</span> {new Date(victim.medical.dateOfDeath).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Family information - Optional */}
                {victim.family && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-gray-800 font-semibold mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Family Contact
                    </h3>
                    <p className="text-gray-900"><span className="font-medium">Contact:</span> {victim.family.headName}</p>
                    {victim.family.contact && <p className="text-gray-900"><span className="font-medium">Phone:</span> {victim.family.contact}</p>}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="mt-4 flex justify-end">
                  <button className="text-red-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}