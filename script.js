document.addEventListener('DOMContentLoaded', () => {
    const arrowContainer = document.querySelector('.arrow-container');
    const distanceElement = document.getElementById('distance');
    const errorElement = document.getElementById('error');

    // --- TARGET COORDINATES ---
    const TARGET_LAT = 59.30993226065298;
    const TARGET_LON = 18.006543224725057;
    // --------------------------

    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = degreesToRadians(lat2 - lat1);
        const dLon = degreesToRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    function calculateBearing(lat1, lon1, lat2, lon2) {
        const phi1 = degreesToRadians(lat1);
        const lambda1 = degreesToRadians(lon1);
        const phi2 = degreesToRadians(lat2);
        const lambda2 = degreesToRadians(lon2);

        const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) -
                  Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
        let theta = Math.atan2(y, x);

        // Convert bearing to degrees (0-360 range)
        let bearing = (theta * 180 / Math.PI + 360) % 360;
        return bearing;
    }

    function updatePosition(position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Clear any previous errors
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        distanceElement.style.display = 'block'; // Ensure distance is visible

        // Calculate distance
        const dist = calculateDistance(userLat, userLon, TARGET_LAT, TARGET_LON);
        distanceElement.textContent = `Distance: ${dist.toFixed(1)} km`; // Display distance rounded to 1 decimal

        // Calculate bearing
        const bearing = calculateBearing(userLat, userLon, TARGET_LAT, TARGET_LON);

        // Update arrow rotation
        if (arrowContainer) {
            arrowContainer.style.transform = `rotate(${bearing}deg)`;
        } else {
            console.error("Arrow container element not found");
        }
    }

    function handleError(error) {
        let message = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = "Location access denied. Please enable location services for this site.";
                break;
            case error.POSITION_UNAVAILABLE:
                message = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                message = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
            default:
                message = "An unknown error occurred while trying to get location.";
                break;
        }
        console.error("Geolocation error:", error.message);
        errorElement.textContent = `Error: ${message}`;
        errorElement.style.display = 'block'; // Show error message
        distanceElement.textContent = 'Cannot calculate distance.'; // Update distance placeholder
        // Optionally hide or reset the arrow
        if (arrowContainer) {
             arrowContainer.style.transform = 'rotate(0deg)'; // Reset arrow
        }
    }

    // Check if Geolocation is supported
    if ('geolocation' in navigator) {
        const geoOptions = {
            enableHighAccuracy: true, // Request more accurate position
            timeout: 10000,        // Maximum time (in ms) to wait for a position
            maximumAge: 0          // Don't use a cached position
        };

        // Use watchPosition to get continuous updates (useful if user moves)
        navigator.geolocation.watchPosition(updatePosition, handleError, geoOptions);

        // Initial message while waiting
        distanceElement.textContent = 'Acquiring location...';

    } else {
        console.error("Geolocation is not supported by this browser.");
        errorElement.textContent = 'Error: Geolocation is not supported by your browser.';
        errorElement.style.display = 'block';
        distanceElement.textContent = 'Cannot calculate distance.';
    }
    // (Inside the script.js file from the previous response)

// ... other functions (degreesToRadians, calculateDistance, etc.) ...

function updatePosition(position) {
    // This function gets called AUTOMATICALLY by watchPosition
    // whenever a new location is available.
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    errorElement.textContent = '';
    errorElement.style.display = 'none';
    distanceElement.style.display = 'block';

    const dist = calculateDistance(userLat, userLon, TARGET_LAT, TARGET_LON);
    distanceElement.textContent = `Distance: ${dist.toFixed(1)} km`; // Updated distance

    const bearing = calculateBearing(userLat, userLon, TARGET_LAT, TARGET_LON);
    if (arrowContainer) {
        arrowContainer.style.transform = `rotate(${bearing}deg)`; // Updated arrow rotation
    }
    // console.log('Position Updated:', userLat, userLon, 'Bearing:', bearing); // Uncomment for debugging
}

function handleError(error) {
    // ... error handling code ...
}

// Check if Geolocation is supported
if ('geolocation' in navigator) {
    const geoOptions = {
        enableHighAccuracy: true, // More accurate, potentially more power-hungry
        timeout: 10000,
        maximumAge: 0 // Force fresh location data
    };

    // THIS IS THE KEY LINE FOR REAL-TIME UPDATES:
    // It sets up the continuous monitoring.
    navigator.geolocation.watchPosition(updatePosition, handleError, geoOptions);

    distanceElement.textContent = 'Acquiring location...';

} else {
    // ... geolocation not supported error handling ...
}
});
