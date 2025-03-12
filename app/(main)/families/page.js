"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#e63946", "#457b9d"];

export default function FamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [supportOptions, setSupportOptions] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedSupport, setSelectedSupport] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});
  const [newSupport, setNewSupport] = useState({ supportType: "", amount: "" });
  const [addingSupport, setAddingSupport] = useState(false);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/families`);
      if (!response.ok) throw new Error("Failed to fetch families");
      const data = await response.json();
      setFamilies(data.families);
      setSupportOptions(data.familySupportOptions);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching families:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSupport = async (familyID) => {
    if (!selectedSupport[familyID]) return;
    setAssigning({ ...assigning, [familyID]: true });

    try {
      const response = await fetch(`/api/families`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyID,
          supportID: selectedSupport[familyID],
        }),
      });

      if (!response.ok) throw new Error("Failed to assign support");
      await fetchFamilies();
    } catch (error) {
      console.error("Error assigning support:", error);
    } finally {
      setAssigning({ ...assigning, [familyID]: false });
    }
  };

  const handleAddSupport = async () => {
    if (!newSupport.supportType || !newSupport.amount) return;
    setAddingSupport(true);

    try {
      const response = await fetch(`/api/families`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupport),
      });

      if (!response.ok) throw new Error("Failed to add support");
      setNewSupport({ supportType: "", amount: "" });
      await fetchFamilies();
    } catch (error) {
      console.error("Error adding support:", error);
    } finally {
      setAddingSupport(false);
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

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Families Dashboard</h1>

        {/* ✅ Pie Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={[
              { name: "Recipients", value: stats.recipientsCount },
              { name: "Non-Recipients", value: stats.nonRecipientsCount }
            ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {COLORS.map((color, index) => (
                <Cell key={index} fill={color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* ✅ List of Families */}
        <h2 className="text-2xl font-semibold mt-6 mb-4">Family List</h2>
        {families.map((family) => (
          <div key={family.familyID} className="bg-white shadow-md p-4 rounded-md my-4">
            {/* ✅ Added Family ID before Family Name */}
            <h2 className="text-xl font-semibold">#{family.familyID} - {family.headName}</h2>
            <p className="text-gray-600">Contact: {family.contact}</p>
            <p className="text-gray-600">Address: {family.address}</p>
            <p className="text-gray-600">Victims: {family.victims.length}</p>

            {/* ✅ If family received support, show support ID */}
            {family.receivedSupport ? (
              <p className="text-green-600">Support Received (ID: {family.supportID}) ✅</p>
            ) : (
              // ✅ If family has NO support, show dropdown to assign support
              <div className="mt-2">
                <label className="text-gray-700">Assign Support:</label>
                <select
                  className="ml-2 px-3 py-2 border rounded-md"
                  value={selectedSupport[family.familyID] || ""}
                  onChange={(e) =>
                    setSelectedSupport({ ...selectedSupport, [family.familyID]: parseInt(e.target.value) })
                  }
                >
                  <option value="">Select Support</option>
                  {supportOptions.map((option) => (
                    <option key={option.supportID} value={option.supportID}>
                      {option.supportType} (${option.amount})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignSupport(family.familyID)}
                  disabled={assigning[family.familyID]}
                  className="ml-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {assigning[family.familyID] ? "Assigning..." : "Assign"}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* ✅ Add New Family Support */}
        <h2 className="text-2xl font-semibold mt-6">Add New Family Support</h2>
        <div className="mt-4 bg-white p-4 shadow-md rounded-md">
          <input
            type="text"
            placeholder="Support Type"
            value={newSupport.supportType}
            onChange={(e) => setNewSupport({ ...newSupport, supportType: e.target.value })}
            className="border p-2 mr-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newSupport.amount}
            onChange={(e) => setNewSupport({ ...newSupport, amount: parseFloat(e.target.value) })}
            className="border p-2 mr-2 rounded-md"
          />
          <button
            onClick={handleAddSupport}
            disabled={addingSupport}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-green-700 transition-colors"
          >
            {addingSupport ? "Adding..." : "Add Support"}
          </button>
        </div>

      </div>
    </div>
  );
}
