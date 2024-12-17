import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";

const MapComponent = () => {
  const [salons, setSalons] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSalons, setFilteredSalons] = useState([]);

  const bucharest = { lat: 44.4268, lng: 26.1025 };

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
        },
        (error) => {
          console.error("Error: The Geolocation service failed.", error);
        }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  }, []);

  const fetchSalons = useCallback(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps API not loaded");
      return;
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      location: userLocation || bucharest,
      radius: 5000,
      type: "beauty_salon",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setSalons(results);
      } else {
        console.error("Places API error:", status);
      }
    });
  }, [userLocation]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    if (userLocation) {
      fetchSalons();
    }
  }, [userLocation, fetchSalons]);

  const mapStyles = {
    height: "100vh",
    width: "100%",
  };

  const handleMarkerClick = (salon) => {
    setSelectedSalon(salon);

    // Fetch directions
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: {
          lat: salon.geometry.location.lat(),
          lng: salon.geometry.location.lng(),
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onBoundsChanged = () => {
    if (map) {
      const bounds = map.getBounds();
      setMapBounds(bounds);
    }
  };

  // Get salons currently visible in the map bounds
  const getVisibleSalons = () => {
    if (!mapBounds) return [];
    return salons.filter((salon) => {
      const lat = salon.geometry.location.lat();
      const lng = salon.geometry.location.lng();
      return mapBounds.contains({ lat, lng });
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!mapBounds) return;

    const visibleSalons = getVisibleSalons();
    const foundSalon = visibleSalons.find((salon) =>
      salon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (foundSalon) {
      map.panTo({
        lat: foundSalon.geometry.location.lat(),
        lng: foundSalon.geometry.location.lng(),
      });
      handleMarkerClick(foundSalon);
    } else {
      console.log("No matching salon found in the visible area.");
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    updateFilteredSalons(newValue);
  };

  const updateFilteredSalons = (term) => {
    if (!term) {
      setFilteredSalons([]);
      return;
    }

    const visibleSalons = getVisibleSalons();
    const filtered = visibleSalons.filter((salon) =>
      salon.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredSalons(filtered);
  };

  const handleSuggestionClick = (salon) => {
    setSearchTerm(salon.name);
    setFilteredSalons([]);
    // Center map and show directions
    map.panTo({
      lat: salon.geometry.location.lat(),
      lng: salon.geometry.location.lng(),
    });
    handleMarkerClick(salon);
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyAbjUx2t3oeoVL4hI_busPJXfTQDgr-4b8"
      libraries={["places", "directions"]}
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={userLocation || bucharest}
        onLoad={onMapLoad}
        onBoundsChanged={onBoundsChanged}
      >
        {/* Custom Search Box in top-right corner */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "white",
            padding: "10px",
            zIndex: 999,
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            width: "200px",
          }}
        >
          <form onSubmit={handleSearch} style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search Salon..."
              value={searchTerm}
              onChange={handleInputChange}
              style={{ padding: "5px", width: "100%" }}
            />
            {filteredSalons.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "35px",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  zIndex: 1000,
                }}
              >
                {filteredSalons.map((salon, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(salon)}
                    style={{
                      padding: "5px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0f0f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fff")
                    }
                  >
                    {salon.name}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Markers for salons */}
        {salons.map((salon, index) => (
          <Marker
            key={index}
            position={{
              lat: salon.geometry.location.lat(),
              lng: salon.geometry.location.lng(),
            }}
            title={salon.name}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
            onClick={() => handleMarkerClick(salon)}
          />
        ))}

        {/* Marker for user's current location */}
        {userLocation && (
          <Marker
            position={userLocation}
            title="Your Location"
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}

        {/* Render selected salon InfoWindow */}
        {selectedSalon && (
          <InfoWindow
            position={{
              lat: selectedSalon.geometry.location.lat(),
              lng: selectedSalon.geometry.location.lng(),
            }}
            onCloseClick={() => setSelectedSalon(null)}
          >
            <div>
              <h3>{selectedSalon.name}</h3>
              <p>{selectedSalon.vicinity}</p>
              <p>
                Rating: {selectedSalon.rating} ({selectedSalon.user_ratings_total}{" "}
                reviews)
              </p>
            </div>
          </InfoWindow>
        )}

        {/* Render directions */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
