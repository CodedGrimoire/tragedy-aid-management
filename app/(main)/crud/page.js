"use client";

import { useEffect, useState } from "react";

export default function VictimPage() {
  const [victims, setVictims] = useState([]);
  const [editingVictim, setEditingVictim] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [events, setEvents] = useState([]);
  const [tragedies, setTragedies] = useState([]);

  // Fetch all victims and existing events/tragedies
  useEffect(() => {
    fetch("/api/crud")
      .then((res) => res.json())
      .then((data) => setVictims(data))
      .catch((err) => console.error("Error fetching victims:", err));

    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error fetching events:", err));

    fetch("/api/tragedies")
      .then((res) => res.json())
      .then((data) => setTragedies(data))
      .catch((err) => console.error("Error fetching tragedies:", err));
  }, []);

  // Handle Delete
  const handleDelete = async (birthCertificateNumber) => {
    if (!confirm("Are you sure you want to delete this victim?")) return;

    try {
      const response = await fetch("/api/crud", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthCertificateNumber }),
      });

      if (response.ok) {
        setVictims(victims.filter((v) => v.birthCertificateNumber !== birthCertificateNumber));
        alert("Victim deleted successfully.");
      } else {
        alert("Error deleting victim.");
      }
    } catch (error) {
      console.error("Error deleting victim:", error);
    }
  };

  // Handle Edit Click
  const handleEdit = (victim) => {
    setEditingVictim(victim.birthCertificateNumber);
    setFormData({
      name: victim.name,
      status: victim.status || "",
      medicalID: victim.medicalID || "",
      eventID: victim.eventID || "",
      eventDescription: victim.event?.description || "",
      eventLocation: victim.event?.location || "",
      familyID: victim.familyID || "",
      familyHead: victim.family?.headName || "",
      tragedyID: victim.tragedyVictims?.[0]?.tragedy?.tragedyID || "",
      tragedyName: victim.tragedyVictims?.[0]?.tragedy?.tragedyName || "",
    });
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Update (Save)
  const handleUpdate = async (birthCertificateNumber) => {
    try {
      const response = await fetch("/api/crud", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthCertificateNumber, ...formData }),
      });

      if (response.ok) {
        const updatedVictim = await response.json();
        setVictims(victims.map((v) => (v.birthCertificateNumber === birthCertificateNumber ? updatedVictim : v)));
        setEditingVictim(null);
        alert("Victim updated successfully.");
      } else {
        alert("Error updating victim.");
      }
    } catch (error) {
      console.error("Error updating victim:", error);
    }
  };

  // Filter victims based on search query
  const filteredVictims = victims.filter((victim) =>
    victim.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Victim Management</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by Name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Birth Certificate No.</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Event</th>
            <th className="border p-2">Event Location</th>
            <th className="border p-2">Tragedy</th>
            <th className="border p-2">Family Head</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVictims.map((victim) => (
            <tr key={victim.birthCertificateNumber} className="border">
              <td className="border p-2">{victim.birthCertificateNumber}</td>
              <td className="border p-2">{victim.name}</td>

              {/* Status Field */}
              <td className="border p-2">
                {editingVictim === victim.birthCertificateNumber ? (
                  <select name="status" value={formData.status} onChange={handleChange} className="border p-1">
                    {["Missing", "Deceased", "Injured", "Found", "Unknown"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  victim.status
                )}
              </td>

              {/* Event Field */}
              <td className="border p-2">
                {editingVictim === victim.birthCertificateNumber ? (
                  <>
                    <select name="eventID" value={formData.eventID} onChange={handleChange} className="border p-1">
                      <option value="">Select Existing Event</option>
                      {events.map((event) => (
                        <option key={event.eventID} value={event.eventID}>
                          {event.description}
                        </option>
                      ))}
                    </select>
                    <input
                      name="eventDescription"
                      placeholder="Or enter new event"
                      value={formData.eventDescription}
                      onChange={handleChange}
                      className="border p-1 mt-1"
                    />
                  </>
                ) : (
                  victim.event?.description
                )}
              </td>

              {/* Event Location Field */}
              <td className="border p-2">
                {editingVictim === victim.birthCertificateNumber ? (
                  <input name="eventLocation" value={formData.eventLocation} onChange={handleChange} className="border p-1" />
                ) : (
                  victim.event?.location
                )}
              </td>

              {/* Tragedy Field */}
              <td className="border p-2">
                {editingVictim === victim.birthCertificateNumber ? (
                  <>
                    <select name="tragedyID" value={formData.tragedyID} onChange={handleChange} className="border p-1">
                      <option value="">Select Existing Tragedy</option>
                      {tragedies.map((tragedy) => (
                        <option key={tragedy.tragedyID} value={tragedy.tragedyID}>
                          {tragedy.tragedyName}
                        </option>
                      ))}
                    </select>
                    <input
                      name="tragedyName"
                      placeholder="Or enter new tragedy"
                      value={formData.tragedyName}
                      onChange={handleChange}
                      className="border p-1 mt-1"
                    />
                  </>
                ) : (
                  victim.tragedyVictims?.[0]?.tragedy?.tragedyName
                )}
              </td>

              {/* Family Head Field */}
              <td className="border p-2">
                {editingVictim === victim.birthCertificateNumber ? (
                  <input name="familyHead" value={formData.familyHead} onChange={handleChange} className="border p-1" />
                ) : (
                  victim.family?.headName
                )}
              </td>

              {/* Action Buttons */}
              <td className="border p-2">
                {editingVictim === victim.birthCertificateNumber ? (
                  <>
                    <button onClick={() => handleUpdate(victim.birthCertificateNumber)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Save</button>
                    <button onClick={() => setEditingVictim(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(victim)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Modify</button>
                    <button onClick={() => handleDelete(victim.birthCertificateNumber)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
