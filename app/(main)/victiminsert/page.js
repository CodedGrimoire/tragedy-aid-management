'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function AddVictim() {
const router = useRouter();
const [isSubmitting, setIsSubmitting] = useState(false);
const [formSubmitted, setFormSubmitted] = useState(false);
const [error, setError] = useState("");
const [formStep, setFormStep] = useState(1);
const [validateOnChange, setValidateOnChange] = useState(false);
const [autoFill, setAutoFill] = useState(false);

const [eventData, setEventData] = useState({ 
  date: "", 
  description: "", 
  location: "" 
});

const [medicalData, setMedicalData] = useState({ 
  medicalID: "", 
  dateOfBirth: "", 
  dateOfDeath: "", 
  medicalCondition: "", 
  bloodGroup: "" 
});

const [familyData, setFamilyData] = useState({ 
  headName: "", 
  contact: "", 
  address: "" 
});

const [victimData, setVictimData] = useState({ 
  birthCertificateNumber: "", 
  name: "", 
  gender: "", 
  status: "" 
});

// Validation errors
const [errors, setErrors] = useState({
  event: {},
  medical: {},
  family: {},
  victim: {}
});

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statusOptions = ["Missing", "Deceased", "Injured", "Found", "Unknown"];
const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" }
];

const commonLocations = [
  "Hospital A", "Hospital B", "City Center", 
  "Main Street", "Central Park", "Downtown",
  "North District", "South District", "East District", "West District"
];

const validateForm = (step) => {
  const newErrors = { ...errors };
  let isValid = true;

  if (step === 1 || step === 0) {
    newErrors.event = {};
    
    if (!eventData.date) {
      newErrors.event.date = "Event date is required";
      isValid = false;
    }
    
    if (!eventData.location || eventData.location.trim() === '') {
      newErrors.event.location = "Location is required";
      isValid = false;
    }
    
    if (!eventData.description || eventData.description.trim() === '') {
      newErrors.event.description = "Description is required";
      isValid = false;
    } else if (eventData.description.length < 10) {
      newErrors.event.description = "Description must be at least 10 characters";
      isValid = false;
    }
  }

  if (step === 2 || step === 0) {
    newErrors.victim = {};
    
    if (!victimData.name || victimData.name.trim() === '') {
      newErrors.victim.name = "Name is required";
      isValid = false;
    }
    
    if (!victimData.birthCertificateNumber || victimData.birthCertificateNumber.trim() === '') {
      newErrors.victim.birthCertificateNumber = "Birth certificate number is required";
      isValid = false;
    } else if (isNaN(parseInt(victimData.birthCertificateNumber, 10))) {
      newErrors.victim.birthCertificateNumber = "Birth certificate number must be numeric";
      isValid = false;
    }
    
    if (!victimData.gender) {
      newErrors.victim.gender = "Gender is required";
      isValid = false;
    }
  }

  if (step === 3 || step === 0) {
    newErrors.medical = {};
    
    if (!medicalData.medicalID || medicalData.medicalID.trim() === '') {
      newErrors.medical.medicalID = "Medical ID is required";
      isValid = false;
    }
    
    if (medicalData.dateOfBirth && medicalData.dateOfDeath) {
      const birthDate = new Date(medicalData.dateOfBirth);
      const deathDate = new Date(medicalData.dateOfDeath);
      
      if (deathDate < birthDate) {
        newErrors.medical.dateOfDeath = "Date of death cannot be before date of birth";
        isValid = false;
      }
    }
  }

  if (step === 4 || step === 0) {
    newErrors.family = {};
    
    if (!familyData.headName || familyData.headName.trim() === '') {
      newErrors.family.headName = "Head name is required";
      isValid = false;
    }
    
    if (!familyData.contact || familyData.contact.trim() === '') {
      newErrors.family.contact = "Contact is required";
      isValid = false;
    } else if (!/^\d{10,15}$/.test(familyData.contact.replace(/[^0-9]/g, ''))) {
      newErrors.family.contact = "Please enter a valid contact number (10-15 digits)";
      isValid = false;
    }
    
    if (!familyData.address || familyData.address.trim() === '') {
      newErrors.family.address = "Address is required";
      isValid = false;
    }
  }

  setErrors(newErrors);
  return isValid;
};

const handleNext = () => {
  if (validateForm(formStep)) {
    setFormStep(prev => prev + 1);
  } else {
    setValidateOnChange(true);
  }
};

const handleBack = () => {
  setFormStep(prev => prev - 1);
};

const fillSampleData = () => {
  if (autoFill) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    setEventData({
      date: yesterday.toISOString().split('T')[0],
      description: "Natural disaster affected the area causing multiple casualties",
      location: "North District, Building 7"
    });
    
    setVictimData({
      birthCertificateNumber: Math.floor(10000000 + Math.random() * 90000000).toString(), // Numeric string
      name: "John Doe",
      gender: "M",
      status: "Injured"
    });
    
    setMedicalData({
      medicalID: generateMedicalID(), 
      dateOfBirth: "1985-06-15",
      dateOfDeath: "",
      medicalCondition: "Multiple fractures, stable condition",
      bloodGroup: "O+"
    });
    
    setFamilyData({
      headName: "Jane Doe",
      contact: "123-456-7890",
      address: "123 Main St, Apartment 4B, North District"
    });
  } else {
    resetForm();
  }
};

useEffect(() => {
  fillSampleData();
}, [autoFill]);

const [existingMedicalRecords, setExistingMedicalRecords] = useState([]);
const [bloodGroupStats, setBloodGroupStats] = useState({});
const [medicalIDExists, setMedicalIDExists] = useState(false);

// Fetch existing medical records for validation/auto-complete
useEffect(() => {
  fetch('/api/medicals')
    .then(response => response.json())
    .then(data => {
      setExistingMedicalRecords(data);
      
      // Calculate blood group statistics
      const stats = data.reduce((acc, record) => {
        const group = record.bloodGroup || 'Unknown';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {});
      setBloodGroupStats(stats);
    })
    .catch(err => console.error('Error fetching medical records:', err));
}, []);

const generateMedicalID = () => {
  const prefix = "MED";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const newID = `${prefix}${timestamp}${random}`;
  
  const exists = existingMedicalRecords.some(record => record.medicalID === newID);
  if (exists) {
    return generateMedicalID();
  }
  
  return newID;
};

useEffect(() => {
  if (medicalData.medicalID) {
    const exists = existingMedicalRecords.some(
      record => record.medicalID === medicalData.medicalID
    );
    setMedicalIDExists(exists);
    
    if (exists) {
      const existingRecord = existingMedicalRecords.find(
        record => record.medicalID === medicalData.medicalID
      );
      
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      setMedicalData({
        ...medicalData,
        dateOfBirth: formatDate(existingRecord.dateOfBirth),
        dateOfDeath: formatDate(existingRecord.dateOfDeath),
        bloodGroup: existingRecord.bloodGroup || "",
        medicalCondition: existingRecord.medicalCondition || ""
      });
    }
  } else {
    setMedicalIDExists(false);
  }
}, [medicalData.medicalID, existingMedicalRecords]);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm(0)) {
    setError("Please correct all errors before submitting.");
    return;
  }
  
  setIsSubmitting(true);
  setError("");
  
  try {
    console.log("Submitting medical data:", medicalData);
    const medicalResponse = await fetch('/api/medicals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'upsert', // Signal to the API to use upsert operation
        medicalID: medicalData.medicalID,
        dateOfBirth: medicalData.dateOfBirth || null,
        dateOfDeath: medicalData.dateOfDeath || null,
        bloodGroup: medicalData.bloodGroup || null,
        medicalCondition: medicalData.medicalCondition || null
      }),
    });

    if (!medicalResponse.ok) {
      const errorData = await medicalResponse.json();
      throw new Error(errorData.error || "Failed to create medical record");
    }

    const medicalResult = await medicalResponse.json();
    console.log("Medical record created/updated:", medicalResult);
    
    console.log("Submitting family data:", familyData);
    const familyResponse = await fetch('/api/family', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        headName: familyData.headName,
        contact: familyData.contact,
        address: familyData.address
      }),
    });

    if (!familyResponse.ok) {
      const errorData = await familyResponse.json();
      throw new Error(errorData.error || "Failed to create family record");
    }

    const familyResult = await familyResponse.json();
    console.log("Family record created:", familyResult);
    
    console.log("Submitting event data:", eventData);
    const eventResponse = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: eventData.date ? new Date(eventData.date).toISOString() : null,
        description: eventData.description,
        location: eventData.location
      }),
    });

    if (!eventResponse.ok) {
      const errorData = await eventResponse.json();
      throw new Error(errorData.error || "Failed to create event record");
    }

    const eventResult = await eventResponse.json();
    console.log("Event record created:", eventResult);
    
    // Get the correct IDs based on response structure
    const finalMedicalID = medicalResult.medicalID || medicalResult.medical?.medicalID || medicalData.medicalID;
    const finalEventID = eventResult.eventID || eventResult.event?.eventID;
    const finalFamilyID = familyResult.familyID || familyResult.family?.familyID;
    
    const victimPayload = {
      birthCertificateNumber: parseInt(victimData.birthCertificateNumber, 10), 
      name: victimData.name,
      gender: victimData.gender,
      status: victimData.status || null,
      medicalID: finalMedicalID,
      eventID: finalEventID,
      familyID: finalFamilyID
    };
    
    console.log("Submitting victim data:", victimPayload);
    const victimResponse = await fetch('/api/victim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(victimPayload),
    });

    // Log the raw response text for debugging
    const responseText = await victimResponse.text();
    console.log("Victim response status:", victimResponse.status);
    console.log("Victim response text:", responseText);
    
    if (!victimResponse.ok) {
      let errorMessage = "Failed to create victim record";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorMessage;
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }
    
    setFormSubmitted(true);
    console.log("All records created successfully!");
    
  } catch (error) {
    console.error("Error submitting form:", error);
    setError(error.message || "An error occurred during submission. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

const resetForm = () => {
  setEventData({ date: "", description: "", location: "" });
  setMedicalData({ 
    medicalID: generateMedicalID(), 
    dateOfBirth: "", 
    dateOfDeath: "", 
    medicalCondition: "", 
    bloodGroup: "" 
  });
  setFamilyData({ headName: "", contact: "", address: "" });
  setVictimData({ birthCertificateNumber: "", name: "", gender: "", status: "" });
  setFormSubmitted(false);
  setFormStep(1);
  setError("");
  setErrors({ event: {}, medical: {}, family: {}, victim: {} });
  setValidateOnChange(false);
};

const [locationSuggestions, setLocationSuggestions] = useState([]);
const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

const handleLocationChange = (e) => {
  const value = e.target.value;
  setEventData({ ...eventData, location: value });
  
  if (value.length > 1) {
    const filteredSuggestions = commonLocations.filter(loc => 
      loc.toLowerCase().includes(value.toLowerCase())
    );
    setLocationSuggestions(filteredSuggestions);
    setShowLocationSuggestions(filteredSuggestions.length > 0);
  } else {
    setShowLocationSuggestions(false);
  }
  
  if (validateOnChange) {
    validateForm(1);
  }
};

const selectLocation = (location) => {
  setEventData({ ...eventData, location });
  setShowLocationSuggestions(false);
};

return (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
    {formSubmitted ? (
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full text-center animate-fade-in">
        <div className="mb-4 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Form Submitted Successfully</h2>
        <p className="text-gray-600 mb-6">The victim information has been recorded in the database.</p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={resetForm}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add Another Victim
          </button>
          <button 
            onClick={() => router.push('/victims')}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            View All Victims
          </button>
        </div>
      </div>
    ) : (
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-2xl w-full space-y-8 animate-fade-in">
        <div className="border-b pb-4">
          <h2 className="text-3xl font-bold text-center text-gray-800">Victim Information</h2>
          <p className="text-center text-gray-500 mt-2">Please fill in all required fields marked with *</p>
          
          {/* Form Controls */}
          <div className="flex flex-col sm:flex-row justify-between mt-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <input 
                type="checkbox" 
                id="autoFill" 
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                checked={autoFill} 
                onChange={() => setAutoFill(!autoFill)} 
              />
              <label htmlFor="autoFill" className="ml-2 text-sm font-medium text-gray-700">
                Auto-fill with sample data
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center">
              <span className="mb-2 sm:mb-0 sm:mr-4 text-sm font-medium text-gray-700">
                {existingMedicalRecords.length > 0 ? 
                  `${existingMedicalRecords.length} medical records in database` : 
                  "Loading medical records..."}
              </span>
              <div className="text-sm font-medium text-gray-700">
                Step {formStep} of 4
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(formStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Event Details */}
          {formStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Event Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Date*</label>
                  <input 
                    type="date" 
                    className={`w-full p-3 border ${errors.event.date ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    value={eventData.date} 
                    onChange={(e) => {
                      setEventData({ ...eventData, date: e.target.value });
                      if (validateOnChange) validateForm(1);
                    }} 
                    max={new Date().toISOString().split('T')[0]} // Prevents future dates
                  />
                  {errors.event.date && <p className="text-red-500 text-xs mt-1">{errors.event.date}</p>}
                </div>
                
                <div className="space-y-2 relative">
                  <label className="block text-sm font-medium text-gray-700">Location*</label>
                  <input 
                    type="text" 
                    placeholder="Where did it happen?" 
                    className={`w-full p-3 border ${errors.event.location ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    value={eventData.location}
                    onChange={handleLocationChange}
                    onFocus={() => {
                      if (eventData.location && locationSuggestions.length > 0) 
                        setShowLocationSuggestions(true);
                    }}
                    onBlur={() => {
                      // Delay hiding to allow clicking on suggestions
                      setTimeout(() => setShowLocationSuggestions(false), 200);
                    }}
                  />
                  {errors.event.location && <p className="text-red-500 text-xs mt-1">{errors.event.location}</p>}
                  
                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {locationSuggestions.map((location, index) => (
                        <div 
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                          onMouseDown={() => selectLocation(location)}
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description*</label>
                <textarea 
                  placeholder="Brief description of the event" 
                  rows="3" 
                  className={`w-full p-3 border ${errors.event.description ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                  value={eventData.description} 
                  onChange={(e) => {
                    setEventData({ ...eventData, description: e.target.value });
                    if (validateOnChange) validateForm(1);
                  }}
                ></textarea>
                {errors.event.description && <p className="text-red-500 text-xs mt-1">{errors.event.description}</p>}
              </div>
            </div>
          )}
          
          {/* Step 2: Victim Details */}
          {formStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Victim Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Name*</label>
                  <input 
                    type="text" 
                    placeholder="Full name" 
                    className={`w-full p-3 border ${errors.victim.name ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    value={victimData.name} 
                    onChange={(e) => {
                      setVictimData({ ...victimData, name: e.target.value });
                      if (validateOnChange) validateForm(2);
                    }}
                  />
                  {errors.victim.name && <p className="text-red-500 text-xs mt-1">{errors.victim.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Birth Certificate Number*</label>
                  <input 
                    type="text" 
                    placeholder="Certificate ID (numeric only)" 
                    className={`w-full p-3 border ${errors.victim.birthCertificateNumber ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    value={victimData.birthCertificateNumber} 
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/\D/g, '');
                      setVictimData({ ...victimData, birthCertificateNumber: value });
                      if (validateOnChange) validateForm(2);
                    }}
                  />
                  {errors.victim.birthCertificateNumber && <p className="text-red-500 text-xs mt-1">{errors.victim.birthCertificateNumber}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Gender*</label>
                  <div className="flex space-x-4">
                    {genderOptions.map((option) => (
                      <label key={option.value} className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600"
                          name="gender"
                          value={option.value}
                          checked={victimData.gender === option.value}
                          onChange={() => {
                            setVictimData({ ...victimData, gender: option.value });
                            if (validateOnChange) validateForm(2);
                          }}
                        />
                        <span className="ml-2 text-black">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.victim.gender && <p className="text-red-500 text-xs mt-1">{errors.victim.gender}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200" 
                    value={victimData.status} 
                    onChange={(e) => setVictimData({ ...victimData, status: e.target.value })}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Medical Details */}
          {formStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Medical Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Medical ID*</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="Medical record identifier" 
                      className={`w-full p-3 border ${errors.medical.medicalID ? 'border-red-500' : medicalIDExists ? 'border-green-500' : 'border-gray-300'} rounded-l-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                      value={medicalData.medicalID} 
                      onChange={(e) => {
                        setMedicalData({ ...medicalData, medicalID: e.target.value });
                        if (validateOnChange) validateForm(3);
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMedicalData({ ...medicalData, medicalID: generateMedicalID() })}
                      className="px-3 py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-r-md border border-l-0 border-gray-300"
                      title="Generate new Medical ID"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {medicalIDExists && (
                    <p className="text-green-600 text-xs mt-1">
                      Existing record found - details auto-filled
                    </p>
                  )}
                  {errors.medical.medicalID && <p className="text-red-500 text-xs mt-1">{errors.medical.medicalID}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <div className="space-y-2">
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200" 
                      value={medicalData.bloodGroup} 
                      onChange={(e) => setMedicalData({ ...medicalData, bloodGroup: e.target.value })}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                    
                    {/* Blood group distribution hint */}
                    {Object.keys(bloodGroupStats).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Current distribution in database:</p>
                        <div className="flex flex-wrap mt-1 gap-2">
                          {Object.entries(bloodGroupStats).map(([group, count]) => (
                            <span key={group} className={`px-2 py-1 rounded-full ${group === medicalData.bloodGroup ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {group}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200" 
                    value={medicalData.dateOfBirth} 
                    onChange={(e) => {
                      setMedicalData({ ...medicalData, dateOfBirth: e.target.value });
                      if (validateOnChange) validateForm(3);
                    }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date of Death</label>
                  <input 
                    type="date" 
                    className={`w-full p-3 border ${errors.medical.dateOfDeath ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    value={medicalData.dateOfDeath} 
                    onChange={(e) => {
                      setMedicalData({ ...medicalData, dateOfDeath: e.target.value });
                      if (validateOnChange) validateForm(3);
                    }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.medical.dateOfDeath && <p className="text-red-500 text-xs mt-1">{errors.medical.dateOfDeath}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Medical Condition</label>
                <textarea 
                  placeholder="Any relevant medical conditions" 
                  rows="2" 
                  className="w-full p-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200" 
                  value={medicalData.medicalCondition} 
                  onChange={(e) => setMedicalData({ ...medicalData, medicalCondition: e.target.value })} 
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Step 4: Family Details */}
          {formStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Family Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Head of Family*</label>
                  <input 
                    type="text" 
                    placeholder="Name of family head" 
                    className={`w-full p-3 border ${errors.family.headName ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    value={familyData.headName} 
                    onChange={(e) => {
                      setFamilyData({ ...familyData, headName: e.target.value });
                      if (validateOnChange) validateForm(4);
                    }}
                  />
                  {errors.family.headName && <p className="text-red-500 text-xs mt-1">{errors.family.headName}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact Number*</label>
                  <input 
                    type="tel" 
                    placeholder="Emergency contact" 
                    className={`w-full p-3 border ${errors.family.contact ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                    value={familyData.contact} 
                    onChange={(e) => {
                      setFamilyData({ ...familyData, contact: e.target.value });
                      if (validateOnChange) validateForm(4);
                    }}
                  />
                  {errors.family.contact && <p className="text-red-500 text-xs mt-1">{errors.family.contact}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Family Address*</label>
                <textarea 
                  placeholder="Complete address" 
                  rows="2" 
                  className={`w-full p-3 border ${errors.family.address ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200`}
                  value={familyData.address} 
                  onChange={(e) => {
                    setFamilyData({ ...familyData, address: e.target.value });
                    if (validateOnChange) validateForm(4);
                  }}
                ></textarea>
                {errors.family.address && <p className="text-red-500 text-xs mt-1">{errors.family.address}</p>}
              </div>
            </div>
          )}

          <div className="pt-6 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
            {formStep > 1 && (
              <button 
                type="button" 
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200"
              >
                Back
              </button>
            )}
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:ml-auto">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200"
              >
                Reset Form
              </button>
              
              {formStep < 4 ? (
                <button 
                  type="button" 
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  Next
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-md text-white transition duration-200 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </div>
                  ) : 'Submit Information'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    )}

    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
    `}</style>
  </div>
)};