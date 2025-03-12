'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TragediesPage() {
  const [tragedies, setTragedies] = useState([]);
  const [selectedTragedy, setSelectedTragedy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTragedies();
  }, []);

  const fetchTragedies = async () => {
    try {
      const response = await fetch('/api/tragedies');
      if (!response.ok) throw new Error('Failed to fetch tragedies');
      const data = await response.json();
      setTragedies(data);
    } catch (error) {
      console.error('Error fetching tragedies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tragedyID) => {
    if (!confirm('Are you sure you want to delete this tragedy?')) return;

    try {
      const response = await fetch(`/api/tragedies?tragedyID=${tragedyID}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete tragedy');
      fetchTragedies();
      setSelectedTragedy(null);
    } catch (error) {
      console.error('Error deleting tragedy:', error);
    }
  };

  const handleAddTragedy = async () => {
    const tragedyName = prompt('Enter the name of the new tragedy:');
    if (!tragedyName) return;

    try {
      const response = await fetch('/api/tragedies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tragedyName }),
      });
      if (!response.ok) throw new Error('Failed to add tragedy');
      fetchTragedies();
    } catch (error) {
      console.error('Error adding tragedy:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="mb-6">
            <button
              className="px-4 py-2 bg-orange-600 text-white rounded-md"
              onClick={handleAddTragedy}
            >
              Add New Tragedy
            </button>
          </div>
          <div className="mb-10">
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
              <h1 className="text-3xl font-semibold">Tragedies Dashboard</h1>
              <p className="text-gray-100">Analyzing critical incidents</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tragedies.map((tragedy) => (
            <div
              key={tragedy.tragedyID}
              className={`p-5 rounded-lg ${selectedTragedy?.tragedyID === tragedy.tragedyID ? 'border-2 border-red-500 bg-red-50' : 'bg-white border border-gray-200'}`}
            >
              <div className="flex justify-between">
                <h3 className="text-lg font-medium text-gray-800">{tragedy.tragedyName}</h3>
                <button
                  className="text-sm text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(tragedy.tragedyID)}
                >
                  Delete
                </button>
              </div>

              <div className="mt-2">
                <button
                  className="text-gray-600 text-sm"
                  onClick={() => setSelectedTragedy(tragedy)}
                >
                  {tragedy.totalVictims} victims (Click for details)
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedTragedy && (
          <div className="mt-10">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selectedTragedy.eventVictimData}>
                <XAxis dataKey="eventID" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="victims" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4">
              {selectedTragedy.eventVictimData.map((event) => (
                <p key={event.eventID} className="text-sm text-gray-700">
                  <strong>Event {event.eventID}:</strong> {event.description}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
