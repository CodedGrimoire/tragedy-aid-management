'use client';

import { useState, useEffect } from 'react';

export default function VictimHealthcarePage() {
  const [victimHealthcareRecords, setVictimHealthcareRecords] = useState([]);
  const [healthcareProviders, setHealthcareProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProvider, setNewProvider] = useState({ name: '', address: '', contact: '' });

  useEffect(() => {
    fetchVictimHealthcare();
  }, []);

  const fetchVictimHealthcare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/medical');
      if (response.ok) {
        const data = await response.json();
        setVictimHealthcareRecords(Array.isArray(data.victims) ? data.victims : []);
        setHealthcareProviders(Array.isArray(data.healthcareProviders) ? data.healthcareProviders : []);
        setFilteredRecords(Array.isArray(data.victims) ? data.victims : []);
      } else {
        console.error('Failed to fetch victim healthcare records');
      }
    } catch (error) {
      console.error('Error fetching victim healthcare:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = victimHealthcareRecords.filter((record) => record.victimName.toLowerCase().includes(query));
    setFilteredRecords(filtered);
  };

  const handleProviderChange = async (victimID, providerID) => {
    try {
      await fetch('/api/medical', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ victimID, providerID }),
      });
      fetchVictimHealthcare();
    } catch (error) {
      console.error('Error updating healthcare provider:', error);
    }
  };

  const handleDelete = async (victimID) => {
    try {
      await fetch('/api/medical', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ victimID }),
      });
      fetchVictimHealthcare();
    } catch (error) {
      console.error('Error removing healthcare provider:', error);
    }
  };

  const handleNewProviderSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/medical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider),
      });
      setNewProvider({ name: '', address: '', contact: '' });
      fetchVictimHealthcare();
    } catch (error) {
      console.error('Error adding healthcare provider:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border-t-4 border-red-600">
          <h1 className="text-3xl font-bold text-red-600">Victim Healthcare Records</h1>
          <p className="text-gray-600 mt-2">Manage healthcare associations</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <input
            type="text"
            placeholder="Search by victim's name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="px-6 py-4">Victim Name</th>
                  <th className="px-6 py-4">Healthcare Provider</th>
                  <th className="px-6 py-4">Services Provided</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.victimID} className="border-b">
                      <td className="px-6 py-4">{record.victimName}</td>
                      <td className="px-6 py-4">
                        <select
                          value={record.providerID || ''}
                          onChange={(e) => handleProviderChange(record.victimID, e.target.value)}
                          className="border rounded-lg px-2 py-1"
                        >
                          <option value="">None</option>
                          {healthcareProviders.map((provider) => (
                            <option key={provider.providerID} value={provider.providerID}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">{record.description}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDelete(record.victimID)} className="text-red-600">Remove</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Add New Healthcare Provider</h2>
          <form onSubmit={handleNewProviderSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={newProvider.name}
              onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
              className="border rounded-lg px-4 py-2 w-full"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={newProvider.address}
              onChange={(e) => setNewProvider({ ...newProvider, address: e.target.value })}
              className="border rounded-lg px-4 py-2 w-full"
              required
            />
            <input
              type="text"
              placeholder="Contact"
              value={newProvider.contact}
              onChange={(e) => setNewProvider({ ...newProvider, contact: e.target.value })}
              className="border rounded-lg px-4 py-2 w-full"
              required
            />
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg">Add Provider</button>
          </form>
        </div>
      </div>
    </div>
  );
}
