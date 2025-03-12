'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#e63946', '#457b9d'];

export default function VictimSubsidyPage() {
  const [victims, setVictims] = useState([]);
  const [subsidyOptions, setSubsidyOptions] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedSubsidy, setSelectedSubsidy] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const [newSubsidy, setNewSubsidy] = useState({ medicalCondition: '', amount: '', eligibility: '' });
  const [addingSubsidy, setAddingSubsidy] = useState(false);

  useEffect(() => {
    fetchVictims();
  }, []);

  const fetchVictims = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gsubsidy`);
      if (!response.ok) throw new Error('Failed to fetch victims');
      const data = await response.json();
      setVictims(data.victims);
      setSubsidyOptions(data.subsidyOptions);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching victims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubsidy = async (birthCertificateNumber) => {
    if (!selectedSubsidy[birthCertificateNumber]) return;
    setAssigning({ ...assigning, [birthCertificateNumber]: true });

    try {
      const response = await fetch(`/api/gsubsidy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthCertificateNumber,
          subsidyID: selectedSubsidy[birthCertificateNumber],
        }),
      });

      if (!response.ok) throw new Error('Failed to assign subsidy');
      await fetchVictims();
    } catch (error) {
      console.error('Error assigning subsidy:', error);
    } finally {
      setAssigning({ ...assigning, [birthCertificateNumber]: false });
    }
  };

  const handleAddSubsidy = async () => {
    if (!newSubsidy.medicalCondition || !newSubsidy.amount || !newSubsidy.eligibility) return;
    setAddingSubsidy(true);

    try {
      const response = await fetch(`/api/gsubsidy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubsidy),
      });

      if (!response.ok) throw new Error('Failed to add subsidy');
      setNewSubsidy({ medicalCondition: '', amount: '', eligibility: '' });
      await fetchVictims();
    } catch (error) {
      console.error('Error adding subsidy:', error);
    } finally {
      setAddingSubsidy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Victim Subsidy Dashboard</h1>

        {/* ✅ Pie Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Subsidy Recipients', value: stats.recipientsCount },
                { name: 'Non-Recipients', value: stats.nonRecipientsCount },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {COLORS.map((color, index) => (
                <Cell key={index} fill={color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* ✅ List of Victims */}
        <h2 className="text-2xl font-semibold mt-6">Victim List</h2>
        {victims.map((victim) => (
          <div key={victim.birthCertificateNumber} className="bg-white shadow-md p-4 rounded-md my-4">
            <h2 className="text-xl">{victim.name} (#{victim.birthCertificateNumber})</h2>
            <p className="text-gray-600">
              Subsidy: {victim.receivedSubsidy ? `✅ (ID: ${victim.subsidyID})` : '❌ No Subsidy'}
            </p>

            {/* ✅ Show dropdown if no subsidy assigned */}
            {!victim.receivedSubsidy && (
              <div className="mt-2">
                <label className="text-gray-700">Assign Subsidy:</label>
                <select
                  className="ml-2 px-3 py-2 border rounded-md"
                  value={selectedSubsidy[victim.birthCertificateNumber] || ''}
                  onChange={(e) =>
                    setSelectedSubsidy({
                      ...selectedSubsidy,
                      [victim.birthCertificateNumber]: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="">Select Subsidy</option>
                  {subsidyOptions.map((option) => (
                    <option key={option.subsidyID} value={option.subsidyID}>
                      {option.medicalCondition} (${option.amount})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignSubsidy(victim.birthCertificateNumber)}
                  disabled={assigning[victim.birthCertificateNumber]}
                  className="ml-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {assigning[victim.birthCertificateNumber] ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* ✅ Add New Subsidy */}
        <h2 className="text-2xl font-semibold mt-6">Add New Subsidy</h2>
        <div className="mt-4 bg-white p-4 shadow-md rounded-md">
          <input
            type="text"
            placeholder="Medical Condition"
            value={newSubsidy.medicalCondition}
            onChange={(e) => setNewSubsidy({ ...newSubsidy, medicalCondition: e.target.value })}
            className="border p-2 mr-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newSubsidy.amount}
            onChange={(e) => setNewSubsidy({ ...newSubsidy, amount: parseFloat(e.target.value) })}
            className="border p-2 mr-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Eligibility"
            value={newSubsidy.eligibility}
            onChange={(e) => setNewSubsidy({ ...newSubsidy, eligibility: e.target.value })}
            className="border p-2 mr-2 rounded-md"
          />
          <button
            onClick={handleAddSubsidy}
            disabled={addingSubsidy}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-green-700 transition-colors"
          >
            {addingSubsidy ? 'Adding...' : 'Add Subsidy'}
          </button>
        </div>
      </div>
    </div>
  );
}
