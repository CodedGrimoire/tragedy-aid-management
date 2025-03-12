'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { GoogleMap, Marker, Circle, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Map configuration
const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 23.8103, // Default center (Dhaka, Bangladesh)
  lng: 90.4125,
};

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

// Service type options
const serviceTypeOptions = [
  "Medical", "Food", "Shelter", "Education", "Clothing", 
  "Counseling", "Legal Aid", "Financial Support", "Water & Sanitation"
];

export default function NGOsPage() {
  // States for main data
  const [ngos, setNGOs] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [victimNeeds, setVictimNeeds] = useState([]);
  const [victims, setVictims] = useState([]);
  
  // UI control states
  const [totalNGOs, setTotalNGOs] = useState(0);
  const [activeNGOs, setActiveNGOs] = useState(0);
  const [totalResources, setTotalResources] = useState(0);
  const [availableResources, setAvailableResources] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterActive, setFilterActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Map states
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [selectedServiceArea, setSelectedServiceArea] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [isAddNGOModalOpen, setIsAddNGOModalOpen] = useState(false);
  const [isAssignNGOModalOpen, setIsAssignNGOModalOpen] = useState(false);
  const [ngoFormData, setNgoFormData] = useState({
    name: '',
    contact: '',
    email: '',
    website: '',
    focusArea: '',
    supportType: '',
    foundedYear: new Date().getFullYear(),
    registrationNo: '',
    primaryContact: '',
    isVerified: false,
    isActive: true,
    address: '',
    description: '',
    availableResources: ''
  });
  const [assignNGOFormData, setAssignNGOFormData] = useState({
    ngoID: '',
    victimID: '',
    serviceType: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    urgencyLevel: 'medium'
  });
  const [serviceAreaFormData, setServiceAreaFormData] = useState({
    locationName: '',
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    radiusKm: 5,
    isActive: true
  });
  const [formTab, setFormTab] = useState('basic');
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  
  // Load Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    libraries: ['places']
  });

  // Fetch NGO data
  useEffect(() => {
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch NGOs
        const ngoResponse = await fetch('/api/ngo');
        if (ngoResponse.ok) {
          const ngoData = await ngoResponse.json();
          setNGOs(ngoData);
          setTotalNGOs(ngoData.length);
          setActiveNGOs(ngoData.filter(ngo => ngo.isActive).length);
        } else {
          console.error('Error fetching NGOs:', await ngoResponse.text());
        }
        
        // Fetch service areas
        try {
          const areasResponse = await fetch('/api/ngo/service-area');
          if (areasResponse.ok) {
            const areasData = await areasResponse.json();
            setServiceAreas(Array.isArray(areasData) ? areasData : []);
          } else {
            console.error('Error fetching service areas:', await areasResponse.text());
            setServiceAreas([]);
          }
        } catch (error) {
          console.error('Exception fetching service areas:', error);
          setServiceAreas([]);
        }
        
        // Fetch inventory
        try {
          const inventoryResponse = await fetch('/api/ngo/inventory');
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            const inventoryArray = Array.isArray(inventoryData) ? inventoryData : [];
            setInventory(inventoryArray);
            setTotalResources(inventoryArray.length);
            setAvailableResources(inventoryArray.filter(i => i.isAvailable).length);
          } else {
            console.error('Error fetching inventory:', await inventoryResponse.text());
            setInventory([]);
            setTotalResources(0);
            setAvailableResources(0);
          }
        } catch (error) {
          console.error('Exception fetching inventory:', error);
          setInventory([]);
          setTotalResources(0);
          setAvailableResources(0);
        }
        
        // Fetch staff
        try {
          const staffResponse = await fetch('/api/ngo/staff');
          if (staffResponse.ok) {
            const staffData = await staffResponse.json();
            setStaff(Array.isArray(staffData) ? staffData : []);
          } else {
            console.error('Error fetching staff:', await staffResponse.text());
            setStaff([]);
          }
        } catch (error) {
          console.error('Exception fetching staff:', error);
          setStaff([]);
        }
        
        // Fetch service requests
        try {
          const requestsResponse = await fetch('/api/service-request');
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json();
            const requestsArray = Array.isArray(requestsData) ? requestsData : [];
            setServiceRequests(requestsArray);
          } else {
            console.error('Error fetching service requests:', await requestsResponse.text());
            setServiceRequests([]);
          }
        } catch (error) {
          console.error('Exception fetching service requests:', error);
          setServiceRequests([]);
        }
        
        // Fetch victim needs
        try {
          const needsResponse = await fetch('/api/victim/need');
          if (needsResponse.ok) {
            const needsData = await needsResponse.json();
            setVictimNeeds(Array.isArray(needsData) ? needsData : []);
          } else {
            console.error('Error fetching victim needs:', await needsResponse.text());
            setVictimNeeds([]);
          }
        } catch (error) {
          console.error('Exception fetching victim needs:', error);
          setVictimNeeds([]);
        }
        
        // Fetch victims for correlation
        const victimsResponse = await fetch('/api/victim');
        if (victimsResponse.ok) {
          const victimsData = await victimsResponse.json();
          setVictims(Array.isArray(victimsData) ? victimsData : []);
        } else {
          console.error('Error fetching victims:', await victimsResponse.text());
          setVictims([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter NGOs based on search and filter options
  const filteredNGOs = useMemo(() => {
    return ngos.filter(ngo => {
      // Filter by search term
      const matchesSearch = 
        (ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.supportType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.focusArea?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by type if not "All"
      const matchesType = 
        filterType === 'All' || 
        ngo.supportType?.includes(filterType) || 
        ngo.focusArea?.includes(filterType);
      
      // Filter by active status
      const matchesActive = !filterActive || ngo.isActive;
      
      return matchesSearch && matchesType && matchesActive;
    });
  }, [ngos, searchTerm, filterType, filterActive]);
  
  // Get service areas for a specific NGO - with safety check
  const getNGOServiceAreas = useCallback((ngoID) => {
    if (!Array.isArray(serviceAreas)) return [];
    return serviceAreas.filter(area => area.ngoID === ngoID);
  }, [serviceAreas]);
  
  // Get inventory for a specific NGO - with safety check
  const getNGOInventory = useCallback((ngoID) => {
    if (!Array.isArray(inventory)) return [];
    return inventory.filter(item => item.ngoID === ngoID);
  }, [inventory]);
  
  // Get staff for a specific NGO - with safety check
  const getNGOStaff = useCallback((ngoID) => {
    if (!Array.isArray(staff)) return [];
    return staff.filter(person => person.ngoID === ngoID);
  }, [staff]);
  
  // Get service requests for a specific NGO - with safety check
  const getNGOServiceRequests = useCallback((ngoID) => {
    if (!Array.isArray(serviceRequests)) return [];
    return serviceRequests.filter(req => req.ngoID === ngoID);
  }, [serviceRequests]);
  
  // Get victims served by a specific NGO - with safety check
  const getVictimsServedByNGO = useCallback((ngoID) => {
    if (!Array.isArray(serviceRequests) || !Array.isArray(victims)) return [];
    const requests = serviceRequests.filter(req => req.ngoID === ngoID);
    const victimIDs = [...new Set(requests.map(req => req.birthCertificateNumber))];
    return victims.filter(victim => victimIDs.includes(victim.birthCertificateNumber));
  }, [serviceRequests, victims]);

  const handleVictimSelection = useCallback((victim) => {
    setAssignNGOFormData(prev => ({
      ...prev,
      victimID: victim.birthCertificateNumber
    }));
  }, []);

  // Handle NGO selection
  const handleNGOClick = useCallback((ngo) => {
    setSelectedNGO(ngo);
    
    // Set map center to first service area of the NGO if available
    const ngoAreas = getNGOServiceAreas(ngo.ngoID);
    if (ngoAreas.length > 0) {
      setMapCenter({
        lat: ngoAreas[0].latitude,
        lng: ngoAreas[0].longitude
      });
    }
    
    setShowInfoWindow(true);
  }, [getNGOServiceAreas]);

  // Handle NGO selection for assignment
  const handleNGOSelection = useCallback((ngo) => {
    setAssignNGOFormData(prev => ({
      ...prev,
      ngoID: ngo.ngoID
    }));
  }, []);
  
  // Handle service area click
  const handleServiceAreaClick = useCallback((area) => {
    setSelectedServiceArea(area);
    setMapCenter({
      lat: area.latitude,
      lng: area.longitude
    });
  }, []);
  
  // Get marker color based on NGO type
  const getMarkerColor = useCallback((ngo) => {
    if (!ngo.supportType && !ngo.focusArea) return '#3182CE'; // Default blue
    
    const type = (ngo.focusArea || ngo.supportType).toLowerCase();
    if (type.includes('medical') || type.includes('health')) return '#E53E3E'; // Red for medical
    if (type.includes('food') || type.includes('nutrition')) return '#38A169'; // Green for food
    if (type.includes('shelter') || type.includes('housing')) return '#DD6B20'; // Orange for shelter
    if (type.includes('education')) return '#805AD5'; // Purple for education
    if (type.includes('clothing')) return '#D69E2E'; // Yellow for clothing
    if (type.includes('counseling')) return '#00B5D8'; // Cyan for counseling
    if (type.includes('legal')) return '#718096'; // Gray for legal aid
    return '#3182CE'; // Default blue
  }, []);

  // Handle NGO form changes
  const handleNGOFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNgoFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handle service area form changes
  const handleServiceAreaFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setServiceAreaFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'latitude' || name === 'longitude' || name === 'radiusKm' ? parseFloat(value) : 
              value
    }));
  }, []);

  // Handle assign NGO form changes
  const handleAssignNGOFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setAssignNGOFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle service area location selection on map
  const handleMapClick = useCallback((e) => {
    if (isAddNGOModalOpen && formTab === 'serviceArea') {
      setServiceAreaFormData(prev => ({
        ...prev,
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng()
      }));
    }
  }, [isAddNGOModalOpen, formTab]);

  // Open modal with NGO data for editing
  const openEditNGOModal = useCallback((ngo) => {
    setNgoFormData({
      ngoID: ngo.ngoID,
      name: ngo.name || '',
      contact: ngo.contact || '',
      email: ngo.email || '',
      website: ngo.website || '',
      focusArea: ngo.focusArea || '',
      supportType: ngo.supportType || '',
      foundedYear: ngo.foundedYear || new Date().getFullYear(),
      registrationNo: ngo.registrationNo || '',
      primaryContact: ngo.primaryContact || '',
      isVerified: ngo.isVerified || false,
      isActive: ngo.isActive || true,
      address: ngo.address || '',
      description: ngo.description || '',
      availableResources: ngo.availableResources || ''
    });
    
    // Get the first service area for this NGO, if any
    const areas = getNGOServiceAreas(ngo.ngoID);
    if (areas.length > 0) {
      setServiceAreaFormData({
        serviceAreaID: areas[0].serviceAreaID,
        ngoID: areas[0].ngoID,
        locationName: areas[0].locationName || '',
        latitude: areas[0].latitude || defaultCenter.lat,
        longitude: areas[0].longitude || defaultCenter.lng,
        radiusKm: areas[0].radiusKm || 5,
        isActive: areas[0].isActive || true
      });
    } else {
      setServiceAreaFormData({
        locationName: '',
        latitude: defaultCenter.lat,
        longitude: defaultCenter.lng,
        radiusKm: 5,
        isActive: true
      });
    }
    
    setEditMode(true);
    setFormTab('basic');
    setIsAddNGOModalOpen(true);
  }, [getNGOServiceAreas]);

  // Reset the form for adding a new NGO
  const openAddNGOModal = useCallback(() => {
    setNgoFormData({
      name: '',
      contact: '',
      email: '',
      website: '',
      focusArea: '',
      supportType: '',
      foundedYear: new Date().getFullYear(),
      registrationNo: '',
      primaryContact: '',
      isVerified: false,
      isActive: true,
      address: '',
      description: '',
      availableResources: ''
    });
    
    setServiceAreaFormData({
      locationName: '',
      latitude: defaultCenter.lat,
      longitude: defaultCenter.lng,
      radiusKm: 5,
      isActive: true
    });
    
    setEditMode(false);
    setFormTab('basic');
    setIsAddNGOModalOpen(true);
  }, []);

  // Open the modal to assign an NGO to a victim
  const openAssignNGOModal = useCallback(() => {
    setAssignNGOFormData({
      ngoID: '',
      victimID: '',
      serviceType: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      urgencyLevel: 'medium'
    });
    
    setIsAssignNGOModalOpen(true);
  }, []);

  // Submit NGO form (create or update)
  const handleNGOFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare the NGO data
      const ngoData = { ...ngoFormData };
      
      // Create or update the NGO
      const ngoResponse = await fetch(`/api/ngo${editMode ? `/${ngoData.ngoID}` : ''}`, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ngoData),
      });
      
      if (!ngoResponse.ok) {
        throw new Error(`Failed to ${editMode ? 'update' : 'create'} NGO: ${await ngoResponse.text()}`);
      }
      
      const savedNGO = await ngoResponse.json();
      
      // Now handle the service area
      if (serviceAreaFormData.locationName) {
        const serviceAreaData = {
          ...serviceAreaFormData,
          ngoID: savedNGO.ngoID,
        };
        
        const areaMethod = serviceAreaData.serviceAreaID ? 'PUT' : 'POST';
        const areaPath = serviceAreaData.serviceAreaID ? 
          `/api/ngo/service-area/${serviceAreaData.serviceAreaID}` : 
          '/api/ngo/service-area';
        
        const areaResponse = await fetch(areaPath, {
          method: areaMethod,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceAreaData),
        });
        
        if (!areaResponse.ok) {
          console.error(`Warning: Failed to save service area: ${await areaResponse.text()}`);
          // Continue anyway
        }
      }
      
      // Refresh the data
      const refreshResponse = await fetch('/api/ngo');
      if (refreshResponse.ok) {
        const refreshedNGOs = await refreshResponse.json();
        setNGOs(refreshedNGOs);
        setTotalNGOs(refreshedNGOs.length);
        setActiveNGOs(refreshedNGOs.filter(ngo => ngo.isActive).length);
      }
      
      const areasResponse = await fetch('/api/ngo/service-area');
      if (areasResponse.ok) {
        const areasData = await areasResponse.json();
        setServiceAreas(Array.isArray(areasData) ? areasData : []);
      }
      
      // Close the modal
      setIsAddNGOModalOpen(false);
      
      // Show success message
      alert(`NGO ${editMode ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      console.error('Error saving NGO:', error);
      alert(`Error ${editMode ? 'updating' : 'creating'} NGO: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [ngoFormData, serviceAreaFormData, editMode]);

  // Submit NGO assignment form
  const handleAssignNGOSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!assignNGOFormData.ngoID || !assignNGOFormData.victimID || !assignNGOFormData.serviceType) {
        throw new Error('NGO, Victim, and Service Type are required');
      }
      
      // Prepare the service data
      const serviceData = {
        birthCertificateNumber: parseInt(assignNGOFormData.victimID),
        ngoID: parseInt(assignNGOFormData.ngoID),
        serviceType: assignNGOFormData.serviceType,
        startDate: new Date(assignNGOFormData.startDate),
        notes: assignNGOFormData.notes,
        status: 'active'
      };
      
      // Create the service
      const serviceResponse = await fetch('/api/ngo/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      if (!serviceResponse.ok) {
        throw new Error(`Failed to create service: ${await serviceResponse.text()}`);
      }
      
      // Create a service request as well
      const requestData = {
        birthCertificateNumber: parseInt(assignNGOFormData.victimID),
        ngoID: parseInt(assignNGOFormData.ngoID),
        requestType: assignNGOFormData.serviceType,
        urgencyLevel: assignNGOFormData.urgencyLevel,
        status: 'approved',
        notes: assignNGOFormData.notes
      };
      
      const requestResponse = await fetch('/api/service-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!requestResponse.ok) {
        console.warn(`Warning: Failed to create service request: ${await requestResponse.text()}`);
        // Continue anyway
      }
      
      // Refresh the data
      const refreshResponse = await fetch('/api/service-request');
      if (refreshResponse.ok) {
        const refreshedRequests = await refreshResponse.json();
        setServiceRequests(Array.isArray(refreshedRequests) ? refreshedRequests : []);
      }
      
      // Close the modal
      setIsAssignNGOModalOpen(false);
      
      // Show success message
      alert('NGO assigned to victim successfully!');
      
    } catch (error) {
      console.error('Error assigning NGO:', error);
      alert(`Error assigning NGO: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [assignNGOFormData]);

  // Delete an NGO
  const handleDeleteNGO = useCallback(async () => {
    if (!editMode || !ngoFormData.ngoID) {
      setDeleteConfirmation(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete the NGO
      const response = await fetch(`/api/ngo/${ngoFormData.ngoID}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete NGO: ${await response.text()}`);
      }
      
      // Refresh the data
      const refreshResponse = await fetch('/api/ngo');
      if (refreshResponse.ok) {
        const refreshedNGOs = await refreshResponse.json();
        setNGOs(refreshedNGOs);
        setTotalNGOs(refreshedNGOs.length);
        setActiveNGOs(refreshedNGOs.filter(ngo => ngo.isActive).length);
      }
      
      // Close the modals
      setDeleteConfirmation(false);
      setIsAddNGOModalOpen(false);
      
      // Show success message
      alert('NGO deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting NGO:', error);
      alert(`Error deleting NGO: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [editMode, ngoFormData.ngoID]);

  // Loading state
  if (loading && (!ngos.length && !serviceAreas.length)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-5">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading NGO Data</h2>
          <p className="text-gray-600">Gathering information about NGOs and their services...</p>
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
            {error}
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-4 md:mb-0">NGO Management</h1>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search NGOs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 p-2 pl-10 border border-red-400 rounded-lg"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border border-red-400 rounded-lg bg-white"
            >
              <option value="All">All Types</option>
              <option value="Medical">Medical</option>
              <option value="Food">Food & Nutrition</option>
              <option value="Shelter">Shelter</option>
              <option value="Education">Education</option>
              <option value="Clothing">Clothing</option>
              <option value="Counseling">Counseling</option>
              <option value="Legal">Legal Aid</option>
            </select>
            
            <button
              onClick={() => setFilterActive(!filterActive)}
              className={`px-4 py-2 rounded-lg ${filterActive ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {filterActive ? 'Active Only' : 'Show All'}
            </button>
          </div>
        </div>
        
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm">Total NGOs</h3>
            <p className="text-2xl font-bold">{totalNGOs}</p>
            <p className="text-sm text-gray-600">{activeNGOs} active</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm">Available Resources</h3>
            <p className="text-2xl font-bold">{totalResources}</p>
            <p className="text-sm text-gray-600">{availableResources} available</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm">Service Areas</h3>
            <p className="text-2xl font-bold">{Array.isArray(serviceAreas) ? serviceAreas.length : 0}</p>
            <p className="text-sm text-gray-600">
              {Array.isArray(serviceAreas) ? serviceAreas.filter(a => a.isActive).length : 0} active
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm">Service Requests</h3>
            <p className="text-2xl font-bold">{Array.isArray(serviceRequests) ? serviceRequests.length : 0}</p>
            <p className="text-sm text-gray-600">
              {Array.isArray(serviceRequests) ? serviceRequests.filter(r => r.status === 'pending').length : 0} pending
            </p>
          </div>
        </div>
        
        {/* Buttons for quick actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={openAddNGOModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New NGO
          </button>
          
          <button
            onClick={openAssignNGOModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Assign NGO to Victim
          </button>
          
          <button
            onClick={() => {
              const newCenter = {
                lat: defaultCenter.lat,
                lng: defaultCenter.lng
              };
              setMapCenter(newCenter);
              setShowInfoWindow(false);
              setSelectedNGO(null);
              setSelectedServiceArea(null);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset Map
          </button>
        </div>
        
        {/* Map View */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">NGO Service Areas</h2>
          <div className="h-[500px] relative">
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={mapCenter}
                options={mapOptions}
                onClick={handleMapClick}
              >
                {/* NGO Markers */}
                {Array.isArray(serviceAreas) && filteredNGOs.map(ngo => {
                  const areas = getNGOServiceAreas(ngo.ngoID);
                  if (areas.length === 0) return null;
                  
                  return areas.map(area => (
                    <div key={area.serviceAreaID}>
                      <Marker
                        position={{ lat: area.latitude, lng: area.longitude }}
                        onClick={() => {
                          handleNGOClick(ngo);
                          handleServiceAreaClick(area);
                        }}
                        icon={{
                          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                          fillColor: getMarkerColor(ngo),
                          fillOpacity: 0.9,
                          strokeWeight: 1,
                          strokeColor: '#FFFFFF',
                          scale: 1.5,
                          anchor: { x: 12, y: 24 },
                        }}
                      />
                      <Circle
                        center={{ lat: area.latitude, lng: area.longitude }}
                        radius={area.radiusKm * 1000}
                        options={{
                          fillColor: getMarkerColor(ngo),
                          fillOpacity: 0.1,
                          strokeColor: getMarkerColor(ngo),
                          strokeOpacity: 0.8,
                          strokeWeight: 1,
                        }}
                        onClick={() => {
                          handleNGOClick(ngo);
                          handleServiceAreaClick(area);
                        }}
                      />
                    </div>
                  ));
                })}
                
                {/* Info Window for selected NGO */}
                {showInfoWindow && selectedNGO && selectedServiceArea && (
                  <InfoWindow
                    position={{
                      lat: selectedServiceArea.latitude,
                      lng: selectedServiceArea.longitude
                    }}
                    onCloseClick={() => setShowInfoWindow(false)}
                  >
                    <div className="p-3 max-w-xs">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedNGO.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Focus:</span> {selectedNGO.focusArea || selectedNGO.supportType}
                      </p>
                      
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-900">Service Area</p>
                        <p className="text-sm text-gray-600">{selectedServiceArea.locationName}</p>
                        <p className="text-sm text-gray-600">Radius: {selectedServiceArea.radiusKm} km</p>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-900">Contact</p>
                        <p className="text-sm text-gray-600">{selectedNGO.contact}</p>
                        {selectedNGO.email && (
                          <p className="text-sm text-gray-600">{selectedNGO.email}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => openEditNGOModal(selectedNGO)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setAssignNGOFormData(prev => ({
                              ...prev,
                              ngoID: selectedNGO.ngoID
                            }));
                            setIsAssignNGOModalOpen(true);
                          }}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
                
                {/* Marker for service area selection in add/edit NGO modal */}
                {isAddNGOModalOpen && formTab === 'serviceArea' && (
                  <Marker
                    position={{
                      lat: serviceAreaFormData.latitude,
                      lng: serviceAreaFormData.longitude
                    }}
                    draggable={true}
                    onDragEnd={(e) => {
                      setServiceAreaFormData(prev => ({
                        ...prev,
                        latitude: e.latLng.lat(),
                        longitude: e.latLng.lng()
                      }));
                    }}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                      fillColor: '#3B82F6',
                      fillOpacity: 0.9,
                      strokeWeight: 1,
                      strokeColor: '#FFFFFF',
                      scale: 1.5,
                      anchor: { x: 12, y: 24 },
                    }}
                  />
                )}
                
                {/* Circle for service area radius preview in add/edit NGO modal */}
                {isAddNGOModalOpen && formTab === 'serviceArea' && (
                  <Circle
                    center={{
                      lat: serviceAreaFormData.latitude,
                      lng: serviceAreaFormData.longitude
                    }}
                    radius={serviceAreaFormData.radiusKm * 1000}
                    options={{
                      fillColor: '#3B82F6',
                      fillOpacity: 0.1,
                      strokeColor: '#3B82F6',
                      strokeOpacity: 0.8,
                      strokeWeight: 1,
                    }}
                  />
                )}
              </GoogleMap>
            )}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'overview' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'serviceAreas' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
              onClick={() => setActiveTab('serviceAreas')}
            >
              Service Areas
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'inventory' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
              onClick={() => setActiveTab('inventory')}
            >
              Inventory
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'staff' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
              onClick={() => setActiveTab('staff')}
            >
              Staff
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'requests' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
              onClick={() => setActiveTab('requests')}
            >
              Service Requests
            </button>
            <button
              className={`px-4 py-3 font-medium ${activeTab === 'victims' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600 hover:text-red-600'}`}
              onClick={() => setActiveTab('victims')}
            >
              Victims Served
            </button>
          </div>
          
          <div className="p-4">
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredNGOs.map(ngo => (
                  <div
                    key={ngo.ngoID}
                    className={`p-4 rounded-lg shadow border ${ngo.isActive ? 'border-green-400' : 'border-gray-300'} hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => handleNGOClick(ngo)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{ngo.name}</h3>
                      <div className="flex gap-1">
                        {ngo.isVerified && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Verified</span>
                        )}
                        {!ngo.isActive && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactive</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <p className="text-gray-600">
                        <span className="font-medium">Focus:</span> {ngo.focusArea || ngo.supportType || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Contact:</span> {ngo.contact || 'N/A'}
                      </p>
                      {ngo.email && (
                        <p className="text-gray-600">
                          <span className="font-medium">Email:</span> {ngo.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="font-medium text-blue-800">{getNGOServiceAreas(ngo.ngoID).length}</p>
                        <p className="text-blue-600">Areas</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="font-medium text-green-800">{getNGOInventory(ngo.ngoID).length}</p>
                        <p className="text-green-600">Resources</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="font-medium text-purple-800">{getNGOStaff(ngo.ngoID).length}</p>
                        <p className="text-purple-600">Staff</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditNGOModal(ngo);
                        }}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignNGOFormData(prev => ({
                            ...prev,
                            ngoID: ngo.ngoID
                          }));
                          setIsAssignNGOModalOpen(true);
                        }}
                        className="p-1 rounded text-green-600 hover:bg-green-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredNGOs.length === 0 && (
                  <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No NGOs match your search criteria.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Service Areas Tab Content */}
            {activeTab === 'serviceAreas' && (
              <div className="max-h-[600px] overflow-y-auto">
                {Array.isArray(serviceAreas) && serviceAreas.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NGO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radius (km)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceAreas.filter(area => {
                        const ngo = ngos.find(n => n.ngoID === area.ngoID);
                        if (!ngo) return false;
                        return filteredNGOs.some(fn => fn.ngoID === ngo.ngoID);
                      }).map(area => {
                        const ngo = ngos.find(n => n.ngoID === area.ngoID);
                        return (
                          <tr key={area.serviceAreaID} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{ngo?.name || 'Unknown NGO'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{area.locationName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{area.radiusKm}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {area.isActive ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactive</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  if (ngo) handleNGOClick(ngo);
                                  handleServiceAreaClick(area);
                                  setMapCenter({
                                    lat: area.latitude,
                                    lng: area.longitude
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2"
                              >
                                View on Map
                              </button>
                              <button
                                onClick={() => {
                                  if (ngo) {
                                    openEditNGOModal(ngo);
                                    setFormTab('serviceArea');
                                    setServiceAreaFormData({
                                      serviceAreaID: area.serviceAreaID,
                                      ngoID: area.ngoID,
                                      locationName: area.locationName,
                                      latitude: area.latitude,
                                      longitude: area.longitude,
                                      radiusKm: area.radiusKm,
                                      isActive: area.isActive
                                    });
                                  }
                                }}
                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No service areas found.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Inventory Tab Content */}
            {activeTab === 'inventory' && (
              <div className="max-h-[600px] overflow-y-auto">
                {Array.isArray(inventory) && inventory.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NGO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.filter(item => {
                        const ngo = ngos.find(n => n.ngoID === item.ngoID);
                        if (!ngo) return false;
                        return filteredNGOs.some(fn => fn.ngoID === ngo.ngoID);
                      }).map(item => {
                        const ngo = ngos.find(n => n.ngoID === item.ngoID);
                        return (
                          <tr key={item.inventoryID} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{ngo?.name || 'Unknown NGO'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.resourceName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.resourceType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.quantity} {item.unit || ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.isAvailable ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Available</span>
                              ) : (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Unavailable</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.lastUpdated ? format(new Date(item.lastUpdated), 'yyyy-MM-dd') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  if (ngo) {
                                    handleNGOClick(ngo);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                View NGO
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No inventory items found.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Staff Tab Content */}
            {activeTab === 'staff' && (
              <div className="max-h-[600px] overflow-y-auto">
                {Array.isArray(staff) && staff.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NGO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staff.filter(person => {
                        const ngo = ngos.find(n => n.ngoID === person.ngoID);
                        if (!ngo) return false;
                        return filteredNGOs.some(fn => fn.ngoID === ngo.ngoID);
                      }).map(person => {
                        const ngo = ngos.find(n => n.ngoID === person.ngoID);
                        return (
                          <tr key={person.staffID} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{ngo?.name || 'Unknown NGO'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{person.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{person.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{person.contact || person.email || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {person.isActive ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactive</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{person.specialization || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  if (ngo) {
                                    handleNGOClick(ngo);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                View NGO
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No staff members found.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Service Requests Tab Content */}
            {activeTab === 'requests' && (
              <div className="max-h-[600px] overflow-y-auto">
                {Array.isArray(serviceRequests) && serviceRequests.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NGO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Victim</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceRequests.filter(request => {
                        const ngo = ngos.find(n => n.ngoID === request.ngoID);
                        if (!ngo) return false;
                        return filteredNGOs.some(fn => fn.ngoID === ngo.ngoID);
                      }).map(request => {
                        const ngo = ngos.find(n => n.ngoID === request.ngoID);
                        const victim = victims.find(v => v.birthCertificateNumber === request.birthCertificateNumber);
                        return (
                          <tr key={request.requestID} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{ngo?.name || 'Unknown NGO'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{victim?.name || `ID: ${request.birthCertificateNumber}`}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{request.requestType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                request.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                                request.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {request.urgencyLevel?.charAt(0).toUpperCase() + request.urgencyLevel?.slice(1) || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {request.status?.replace('_', ' ').charAt(0).toUpperCase() + request.status?.replace('_', ' ').slice(1) || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {request.requestDate ? format(new Date(request.requestDate), 'yyyy-MM-dd') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  if (ngo) {
                                    handleNGOClick(ngo);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2"
                              >
                                View NGO
                              </button>
                              <button
                                onClick={() => {
                                  setAssignNGOFormData({
                                    ngoID: request.ngoID,
                                    victimID: request.birthCertificateNumber,
                                    serviceType: request.requestType,
                                    startDate: format(new Date(), 'yyyy-MM-dd'),
                                    notes: request.notes || '',
                                    urgencyLevel: request.urgencyLevel || 'medium'
                                  });
                                  setIsAssignNGOModalOpen(true);
                                }}
                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No service requests found.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Victims Served Tab Content */}
            {activeTab === 'victims' && (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredNGOs.map(ngo => {
                    const servedVictims = getVictimsServedByNGO(ngo.ngoID);
                    if (servedVictims.length === 0) return null;
                    
                    return (
                      <div key={ngo.ngoID} className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{ngo.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Focus:</span> {ngo.focusArea || ngo.supportType || 'N/A'}
                        </p>
                        
                        <h4 className="text-md font-medium text-gray-800 mb-2">Victims Served ({servedVictims.length})</h4>
                        <ul className="divide-y divide-gray-200">
                          {servedVictims.slice(0, 5).map(victim => (
                            <li key={victim.birthCertificateNumber} className="py-2">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-700">{victim.name}</p>
                                <button
                                  onClick={() => {
                                    setAssignNGOFormData({
                                      ngoID: ngo.ngoID,
                                      victimID: victim.birthCertificateNumber,
                                      serviceType: '',
                                      startDate: format(new Date(), 'yyyy-MM-dd'),
                                      notes: '',
                                      urgencyLevel: 'medium'
                                    });
                                    setIsAssignNGOModalOpen(true);
                                  }}
                                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200"
                                >
                                  Update Service
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                ID: {victim.birthCertificateNumber} | Status: {victim.status || 'N/A'}
                              </p>
                            </li>
                          ))}
                          
                          {servedVictims.length > 5 && (
                            <li className="py-2 text-center">
                              <span className="text-sm text-gray-500">
                                +{servedVictims.length - 5} more victims...
                              </span>
                            </li>
                          )}
                        </ul>
                        
                        <div className="mt-3 text-right">
                          <button
                            onClick={() => handleNGOClick(ngo)}
                            className="text-sm text-blue-600 hover:text-blue-900"
                          >
                            View NGO Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredNGOs.filter(ngo => getVictimsServedByNGO(ngo.ngoID).length > 0).length === 0 && (
                    <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No victims are currently being served by the filtered NGOs.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer note */}
        <div className="text-center text-gray-500 text-sm mt-6">
          <p>NGO Management System for Disaster Relief and Victim Support</p>
        </div>
      </div>

      {/* Add/Edit NGO Modal */}
      <Transition appear show={isAddNGOModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddNGOModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                  >
                    {editMode ? 'Edit NGO' : 'Add New NGO'}
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setIsAddNGOModalOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Dialog.Title>
                  
                  {/* Form tabs */}
                  <div className="mt-4 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      <button
                        onClick={() => setFormTab('basic')}
                        className={`${
                          formTab === 'basic'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Basic Information
                      </button>
                      <button
                        onClick={() => setFormTab('serviceArea')}
                        className={`${
                          formTab === 'serviceArea'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Service Area
                      </button>
                      <button
                        onClick={() => setFormTab('advanced')}
                        className={`${
                          formTab === 'advanced'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Advanced Settings
                      </button>
                    </nav>
                  </div>
                  
                  <form onSubmit={handleNGOFormSubmit} className="mt-4">
                    {/* Basic Info Tab */}
                    {formTab === 'basic' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              NGO Name*
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={ngoFormData.name}
                              onChange={handleNGOFormChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                              Contact Number
                            </label>
                            <input
                              type="text"
                              name="contact"
                              id="contact"
                              value={ngoFormData.contact}
                              onChange={handleNGOFormChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={ngoFormData.email}
                              onChange={handleNGOFormChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                              Website
                            </label>
                            <input
                              type="text"
                              name="website"
                              id="website"
                              value={ngoFormData.website}
                              onChange={handleNGOFormChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="focusArea" className="block text-sm font-medium text-gray-700">
                              Focus Area
                            </label>
                            <select
                              name="focusArea"
                              id="focusArea"
                              value={ngoFormData.focusArea}
                              onChange={handleNGOFormChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            >
                              <option value="">Select Focus Area</option>
                              {serviceTypeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="supportType" className="block text-sm font-medium text-gray-700">
                              Support Type
                            </label>
                            <input
                              type="text"
                              name="supportType"
                              id="supportType"
                              value={ngoFormData.supportType}
                              onChange={handleNGOFormChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                              placeholder="e.g., Financial, Material, Services"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address
                          </label>
                          <textarea
                            name="address"
                            id="address"
                            rows={2}
                            value={ngoFormData.address}
                            onChange={handleNGOFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={ngoFormData.isActive}
                                onChange={handleNGOFormChange}
                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Active NGO
                              </label>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                name="isVerified"
                                id="isVerified"
                                checked={ngoFormData.isVerified}
                                onChange={handleNGOFormChange}
                                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-900">
                                Verified NGO
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Service Area Tab */}
                    {formTab === 'serviceArea' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                          Define the geographic service area for this NGO. Click on the map to set the center point, then define a radius.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
                              Location Name
                            </label>
                            <input
                              type="text"
                              name="locationName"
                              id="locationName"
                              value={serviceAreaFormData.locationName}
                              onChange={handleServiceAreaFormChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                              placeholder="e.g., Downtown Dhaka"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="radiusKm" className="block text-sm font-medium text-gray-700">
                              Service Radius (km)
                            </label>
                            <input
                              type="number"
                              name="radiusKm"
                              id="radiusKm"
                              value={serviceAreaFormData.radiusKm}
                              onChange={handleServiceAreaFormChange}
                              min="0.1"
                              step="0.1"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                              Latitude
                            </label>
                            <input
                              type="number"
                              name="latitude"
                              id="latitude"
                              value={serviceAreaFormData.latitude}
                              onChange={handleServiceAreaFormChange}
                              step="0.000001"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                              Longitude
                            </label>
                            <input
                              type="number"
                              name="longitude"
                              id="longitude"
                              value={serviceAreaFormData.longitude}
                              onChange={handleServiceAreaFormChange}
                              step="0.000001"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="isActive"
                            id="serviceAreaActive"
                            checked={serviceAreaFormData.isActive}
                            onChange={handleServiceAreaFormChange}
                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <label htmlFor="serviceAreaActive" className="ml-2 block text-sm text-gray-900">
                            Active Service Area
                          </label>
                        </div>
                        
                        <div className="h-[300px] border border-gray-300 rounded-md overflow-hidden">
                          {isLoaded && (
                            <GoogleMap
                              mapContainerStyle={{ width: '100%', height: '100%' }}
                              zoom={8}
                              center={{ lat: serviceAreaFormData.latitude, lng: serviceAreaFormData.longitude }}
                              options={mapOptions}
                              onClick={handleMapClick}
                            >
                              <Marker
                                position={{
                                  lat: serviceAreaFormData.latitude,
                                  lng: serviceAreaFormData.longitude
                                }}
                                draggable={true}
                                onDragEnd={(e) => {
                                  setServiceAreaFormData(prev => ({
                                    ...prev,
                                    latitude: e.latLng.lat(),
                                    longitude: e.latLng.lng()
                                  }));
                                }}
                              />
                              <Circle
                                center={{
                                  lat: serviceAreaFormData.latitude,
                                  lng: serviceAreaFormData.longitude
                                }}
                                radius={serviceAreaFormData.radiusKm * 1000}
                                options={{
                                  fillColor: '#3B82F6',
                                  fillOpacity: 0.1,
                                  strokeColor: '#3B82F6',
                                  strokeOpacity: 0.8,
                                  strokeWeight: 1,
                                }}
                              />
                            </GoogleMap>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Tip: You can click on the map to set a location or drag the marker to adjust the position.
                        </p>
                      </div>
                    )}
                    
                    {/* Advanced Settings Tab */}
                    {formTab === 'advanced' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                          <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
                              Founded Year
                            </label>
                            <input
                              type="number"
                              name="foundedYear"
                              id="foundedYear"
                              value={ngoFormData.foundedYear}
                              onChange={handleNGOFormChange}
                              min="1900"
                              max={new Date().getFullYear()}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="registrationNo" className="block text-sm font-medium text-gray-700">
                              Registration Number
                            </label>
                            <input
                              type="text"
                              name="registrationNo"
                              id="registrationNo"
                              value={ngoFormData.registrationNo}
                              onChange={handleNGOFormChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="primaryContact" className="block text-sm font-medium text-gray-700">
                            Primary Contact Person
                          </label>
                          <input
                            type="text"
                            name="primaryContact"
                            id="primaryContact"
                            value={ngoFormData.primaryContact}
                            onChange={handleNGOFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="availableResources" className="block text-sm font-medium text-gray-700">
                            Available Resources
                          </label>
                          <textarea
                            name="availableResources"
                            id="availableResources"
                            rows={3}
                            value={ngoFormData.availableResources}
                            onChange={handleNGOFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            placeholder="List of resources available from this NGO"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={4}
                            value={ngoFormData.description}
                            onChange={handleNGOFormChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                            placeholder="Detailed description of the NGO's mission and activities"
                          />
                        </div>
                        
                        {editMode && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmation(true)}
                              className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            >
                              Delete NGO
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Form buttons */}
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsAddNGOModalOpen(false)}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        {editMode ? 'Update' : 'Create'} NGO
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Assign NGO to Victim Modal */}
      <Transition appear show={isAssignNGOModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAssignNGOModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                  >
                    Assign NGO to Victim
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setIsAssignNGOModalOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Dialog.Title>
                  
                  <form onSubmit={handleAssignNGOSubmit} className="mt-4">
                    <div className="space-y-4">
                      {/* NGO Selection */}
                      <div>
                        <label htmlFor="ngoID" className="block text-sm font-medium text-gray-700">
                          Select NGO*
                        </label>
                        <select
                          name="ngoID"
                          id="ngoID"
                          value={assignNGOFormData.ngoID}
                          onChange={handleAssignNGOFormChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        >
                          <option value="">Select an NGO</option>
                          {ngos.map(ngo => (
                            <option key={ngo.ngoID} value={ngo.ngoID}>
                              {ngo.name} - {ngo.focusArea || ngo.supportType || 'General'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* NGO Details (if selected) */}
                      {assignNGOFormData.ngoID && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          {ngos.filter(ngo => ngo.ngoID === parseInt(assignNGOFormData.ngoID)).map(ngo => (
                            <div key={ngo.ngoID} className="text-sm">
                              <p className="font-medium text-gray-900">{ngo.name}</p>
                              <p className="text-gray-600">Focus: {ngo.focusArea || ngo.supportType || 'General'}</p>
                              <p className="text-gray-600">Contact: {ngo.contact || 'N/A'}</p>
                              <div className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  ngo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {ngo.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {ngo.isVerified && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Victim Selection */}
                      <div>
                        <label htmlFor="victimID" className="block text-sm font-medium text-gray-700">
                          Select Victim*
                        </label>
                        <select
                          name="victimID"
                          id="victimID"
                          value={assignNGOFormData.victimID}
                          onChange={handleAssignNGOFormChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        >
                          <option value="">Select a Victim</option>
                          {victims.map(victim => (
                            <option key={victim.birthCertificateNumber} value={victim.birthCertificateNumber}>
                              {victim.name} - ID: {victim.birthCertificateNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Victim Details (if selected) */}
                      {assignNGOFormData.victimID && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          {victims.filter(victim => victim.birthCertificateNumber === parseInt(assignNGOFormData.victimID)).map(victim => (
                            <div key={victim.birthCertificateNumber} className="text-sm">
                              <p className="font-medium text-gray-900">{victim.name}</p>
                              <p className="text-gray-600">ID: {victim.birthCertificateNumber}</p>
                              <p className="text-gray-600">Gender: {victim.gender || 'N/A'}</p>
                              <p className="text-gray-600">Status: {victim.status || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Service Type */}
                      <div>
                        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                          Service Type*
                        </label>
                        <select
                          name="serviceType"
                          id="serviceType"
                          value={assignNGOFormData.serviceType}
                          onChange={handleAssignNGOFormChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        >
                          <option value="">Select Service Type</option>
                          {serviceTypeOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Urgency Level */}
                      <div>
                        <label htmlFor="urgencyLevel" className="block text-sm font-medium text-gray-700">
                          Urgency Level
                        </label>
                        <select
                          name="urgencyLevel"
                          id="urgencyLevel"
                          value={assignNGOFormData.urgencyLevel}
                          onChange={handleAssignNGOFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      
                      {/* Start Date */}
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          id="startDate"
                          value={assignNGOFormData.startDate}
                          onChange={handleAssignNGOFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        />
                      </div>
                      
                      {/* Notes */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          id="notes"
                          rows={3}
                          value={assignNGOFormData.notes}
                          onChange={handleAssignNGOFormChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                          placeholder="Any additional information about this service assignment"
                        />
                      </div>
                    </div>
                    
                    {/* Form buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsAssignNGOModalOpen(false)}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Assign NGO
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Delete Confirmation Modal */}
      <Transition appear show={deleteConfirmation} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setDeleteConfirmation(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the NGO "{ngoFormData.name}"? This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-2 p-3 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700">
                        This will also delete all service areas and assignments associated with this NGO.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => setDeleteConfirmation(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={handleDeleteNGO}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}