// utils/geoUtils.js

/**
 * Calculates distance between two geographic coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lon1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lon2 - Longitude of second point in degrees
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    // Convert latitude and longitude from degrees to radians
    const toRadian = angle => (Math.PI / 180) * angle;
    const radLat1 = toRadian(lat1);
    const radLon1 = toRadian(lon1);
    const radLat2 = toRadian(lat2);
    const radLon2 = toRadian(lon2);
  
    // Haversine formula
    const deltaLat = radLat2 - radLat1;
    const deltaLon = radLon2 - radLon1;
    
    const a = 
      Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
      Math.cos(radLat1) * Math.cos(radLat2) * 
      Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // Earth's radius in kilometers
    const EARTH_RADIUS = 6371;
    
    // Calculate the distance
    const distance = EARTH_RADIUS * c;
    
    return distance;
  }
  
  /**
   * Finds NGOs that can serve a specific location based on their service area radius
   * @param {number} latitude - Latitude of the target location (event or victim)
   * @param {number} longitude - Longitude of the target location (event or victim)
   * @param {Array} ngoServiceAreas - Array of NGO service area objects with ngoID, latitude, longitude, and radiusKm
   * @returns {Array} Array of ngoIDs that can serve the location
   */
  export function findNGOsInRadius(latitude, longitude, ngoServiceAreas) {
    if (!latitude || !longitude || !ngoServiceAreas?.length) {
      return [];
    }
  
    return ngoServiceAreas
      .filter(area => {
        if (!area.latitude || !area.longitude || !area.radiusKm || !area.isActive) {
          return false;
        }
        
        const distance = calculateDistance(
          latitude,
          longitude,
          area.latitude,
          area.longitude
        );
        
        return distance <= area.radiusKm;
      })
      .map(area => ({
        ngoID: area.ngoID,
        distance: calculateDistance(
          latitude,
          longitude,
          area.latitude,
          area.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)
  }
  
  /**
   * Checks if a specific NGO can serve a specific location
   * @param {number} ngoID - ID of the NGO to check
   * @param {number} latitude - Latitude of the target location
   * @param {number} longitude - Longitude of the target location
   * @param {Array} ngoServiceAreas - Array of NGO service area objects
   * @returns {boolean} Whether the NGO can serve the location
   */
  export function canNGOServeLocation(ngoID, latitude, longitude, ngoServiceAreas) {
    const ngoAreas = ngoServiceAreas.filter(area => area.ngoID === ngoID && area.isActive);
    
    if (!ngoAreas.length) {
      return false;
    }
    
    return ngoAreas.some(area => {
      const distance = calculateDistance(
        latitude,
        longitude,
        area.latitude,
        area.longitude
      );
      
      return distance <= area.radiusKm;
    });
  }