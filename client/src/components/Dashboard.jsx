// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import './Map.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useYouTube } from '../hooks/useYouTube';
import IntelligentSearch from './IntelligentSearch';
import LocalVideos from './LocalVideos';
import VideoPlayer from './VideoPlayer';
import ProfileSection from './ProfileSection';
import CommentsSection from './CommentsSection';
import HistorySection from './HistorySection';

const Dashboard = ({ user, message, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || user?.name || '',
    email: user?.email || '',
    foto: user?.foto || ''
  });

  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState('');
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [map, setMap] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [showIntelligentSearch, setShowIntelligentSearch] = useState(false);
  const [showLocalVideos, setShowLocalVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const mapContainer = useRef(null);

  const {
    videos,
    loading: youtubeLoading,
    error: youtubeError,
    currentSearch,
    searchVideosByLocation,
    clearVideos,
    closeSearch
  } = useYouTube();

  const isGoogleUser = user?.google_id;
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const userLocationMarkerRef = useRef(null);
  const selectedLocationMarkerRef = useRef(null);

  useEffect(() => {
    if (activeSection !== 'dashboard') {
      localStorage.setItem('activeSection', activeSection);
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'dashboard') {
      if (mapContainer.current && !map) {
        initializeMap();
      } else if (map) {
        setTimeout(() => {
          if (map && map.getContainer()) {
            map.resize();
          }
        }, 300);
      }
    }
  }, [activeSection, map]);

  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, []);

  const getLocationName = async (latitude, longitude) => {
    if (!mapboxToken) {
      return 'Ubicación no disponible';
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
        `access_token=${mapboxToken}&` +
        `types=place,locality,neighborhood,region,country&` +
        `limit=1&` +
        `language=es`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          return data.features[0].place_name;
        }
      }
    } catch (error) {
      console.error('Error obteniendo nombre de ubicación:', error);
    }
    
    return 'Ubicación desconocida';
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  useEffect(() => {
    if (!youtubeLoading && selectedLocation && videos.length === 0 && !youtubeError) {
      if (currentSearch.query) {
        showNotification(`No se encontraron videos sobre "${currentSearch.query}" en esta ubicación específica`, 'warning');
      } else {
        showNotification('No se encontraron videos específicos para esta ubicación', 'warning');
      }
    }
  }, [videos, youtubeLoading, selectedLocation, youtubeError, currentSearch.query]);

  const registerVideoView = async (video) => {
    try {
      const token = localStorage.getItem('token');
      
      const videoData = {
        youtube_video_id: video.id,
        titulo: video.title,
        descripcion: video.description || '',
        location_name: video.location?.name || '',
        latitude: video.location?.latitude || null,
        longitude: video.location?.longitude || null,
        vistas_totales: 1
      };

      const response = await fetch('http://localhost:5000/api/videos/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(videoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar el video');
      }

      const result = await response.json();
      console.log('Video registrado:', result);
      
    } catch (error) {
      console.error('Error registrando video:', error);
    }
  };

  const handleVideoClick = async (video) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
    
    await registerVideoView(video);
  };

  // FUNCIÓN CORREGIDA - Marcadores simplificados
  const createMarkerElement = (isUserLocation = false) => {
    const el = document.createElement('div');
    
    if (isUserLocation) {
      // 🟥 Marcador de ubicación actual (ROJO)
      el.className = 'user-location-marker';
      el.innerHTML = `
        <div class="user-location-arrow"></div>
        <div class="user-location-pulse"></div>
      `;
    } else {
      // 🟩 Marcador de ubicación seleccionada (VERDE)
      el.className = 'selected-location-marker';
      el.innerHTML = `
        <div class="selected-location-arrow"></div>
        <div class="selected-location-pulse"></div>
      `;
    }
    
    return el;
  };

  const addUserLocationMarker = (longitude, latitude, locationName) => {
    if (!map) {
      console.error('Map not available for user location marker');
      return;
    }
    
    // Limpiar marcador anterior si existe
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
      userLocationMarkerRef.current = null;
    }

    console.log('🟥 Adding USER location marker at:', { longitude, latitude });

    try {
      const markerElement = createMarkerElement(true);
      
      userLocationMarkerRef.current = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #EF4444;">
              <span style="color: #EF4444;">●</span> Mi Ubicación Actual
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${locationName}<br>
              Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}
            </p>
          </div>
        `))
        .addTo(map);
      
      console.log('✅ USER location marker added successfully');
      
      // Abrir popup automáticamente
      setTimeout(() => {
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.togglePopup();
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error adding user location marker:', error);
    }
  };

  const addSelectedLocationMarker = (longitude, latitude, locationName, query = '') => {
    if (!map) {
      console.error('Map not available for selected location marker');
      return;
    }
    
    // Limpiar marcador anterior si existe
    if (selectedLocationMarkerRef.current) {
      selectedLocationMarkerRef.current.remove();
      selectedLocationMarkerRef.current = null;
    }

    console.log('🟩 Adding SELECTED location marker at:', { longitude, latitude });

    try {
      const markerElement = createMarkerElement(false);
      
      selectedLocationMarkerRef.current = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #10B981;">
              <span style="color: #10B981;">●</span> Ubicación Seleccionada
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${locationName}<br>
              ${query ? `Buscando: "${query}"` : 'Buscando videos locales...'}<br>
              Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}
            </p>
          </div>
        `))
        .addTo(map);
      
      console.log('✅ SELECTED location marker added successfully');
      
      // Abrir popup automáticamente
      setTimeout(() => {
        if (selectedLocationMarkerRef.current) {
          selectedLocationMarkerRef.current.togglePopup();
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error adding selected location marker:', error);
    }
  };

  const initializeMap = () => {
    if (!mapboxToken) {
      console.error('Mapbox token no encontrado');
      showNotification('Token de Mapbox no configurado', 'error');
      return;
    }

    setMapLoading(true);
    mapboxgl.accessToken = mapboxToken;

    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.5, 40],
        zoom: 2,
        attributionControl: false
      });

      newMap.addControl(new mapboxgl.NavigationControl());
      newMap.addControl(new mapboxgl.FullscreenControl());

      newMap.on('click', async (e) => {
        console.log('🗺️ Map click detected at:', e.lngLat);
        await handleMapClick(e.lngLat);
      });

      newMap.on('load', () => {
        setMap(newMap);
        setMapLoading(false);
        console.log('✅ Mapa inicializado correctamente');
      });

      newMap.on('error', (error) => {
        console.error('❌ Error loading map:', error);
        setMapLoading(false);
        showNotification('Error al cargar el mapa', 'error');
      });

      newMap.on('resize', () => {
        newMap.resize();
      });

    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      setMapLoading(false);
      showNotification('Error al inicializar el mapa', 'error');
    }
  };

  const handleMapClick = async (lngLat) => {
    const { lng, lat } = lngLat;
    
    console.log('=== 🗺️ MAP CLICK START ===');
    console.log('📍 Map click - Coordinates:', { lng, lat });
    
    try {
      const locationName = await getLocationName(lat, lng);
      console.log('🏷️ Location name obtained:', locationName);
      
      setSelectedLocation({ latitude: lat, longitude: lng });
      setSelectedLocationName(locationName);
      
      if (map) {
        console.log('🟩 Adding selected location marker...');
        addSelectedLocationMarker(lng, lat, locationName, currentSearch.query);
        
        // Mover el mapa a la ubicación seleccionada
        map.flyTo({
          center: [lng, lat],
          zoom: 12,
          essential: true
        });
        
        console.log('✅ Map moved to selected location');
      }

      const searchQuery = currentSearch.query;
      console.log('🔍 Searching with query:', searchQuery);
      
      // SIN RADIO - búsqueda normal
      if (searchQuery) {
        searchVideosByLocation(lat, lng, searchQuery);
      } else {
        searchVideosByLocation(lat, lng, '');
      }

      showNotification(`📍 Ubicación seleccionada: ${locationName}`, 'info');
      console.log('=== ✅ MAP CLICK COMPLETED ===');
      
    } catch (error) {
      console.error('❌ Error in handleMapClick:', error);
      showNotification('Error al seleccionar ubicación', 'error');
    }
  };

  const handleIntelligentSearch = async (latitude, longitude, query, radius) => {
    const locationName = await getLocationName(latitude, longitude);
    setSelectedLocation({ latitude, longitude });
    setSelectedLocationName(locationName);
    
    if (map) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 12
      });
      addSelectedLocationMarker(longitude, latitude, locationName, query);
    }
    
    // SIN RADIO - búsqueda normal
    searchVideosByLocation(latitude, longitude, query);
    setShowIntelligentSearch(false);
  };

  const handleSearchAroundMe = async (latitude, longitude, query, radius) => {
    const locationName = await getLocationName(latitude, longitude);
    
    setUserLocation({ latitude, longitude });
    setUserLocationName(locationName);
    
    if (map) {
      map.flyTo({
        center: [longitude, latitude],
        zoom: 14
      });
      addUserLocationMarker(longitude, latitude, locationName);
    }
    
    // SIN RADIO - búsqueda normal
    searchVideosByLocation(latitude, longitude, query);
    setShowIntelligentSearch(false);
  };

  const handleActivateIntelligentSearch = () => {
    if (!selectedLocation && !userLocation) {
      showNotification('Por favor, selecciona una ubicación en el mapa o activa tu ubicación primero', 'warning');
      return;
    }
    setShowIntelligentSearch(true);
  };

  const handleActivateLocalVideos = () => {
    setShowLocalVideos(true);
  };

  const handleDiscoverLocalVideos = async (region) => {
    const locationName = await getLocationName(region.lat, region.lng);
    setSelectedLocation({ 
      latitude: region.lat, 
      longitude: region.lng 
    });
    setSelectedLocationName(locationName);

    if (map) {
      map.flyTo({
        center: [region.lng, region.lat],
        zoom: 12
      });

      addSelectedLocationMarker(region.lng, region.lat, locationName, region.query);
    }

    // SIN RADIO - búsqueda normal
    searchVideosByLocation(region.lat, region.lng, region.query);
    setShowLocalVideos(false);
    showNotification(`🔍 Descubriendo videos en ${region.name}`, 'info');
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocalización no soportada');
      showNotification('Tu navegador no soporta geolocalización', 'error');
      return;
    }

    setMapLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log('=== 📍 GET USER LOCATION START ===');
        console.log('📍 Geolocation coordinates:', { latitude, longitude });
        
        if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
          showNotification('Ubicación no válida obtenida', 'error');
          setMapLoading(false);
          return;
        }
        
        const locationName = await getLocationName(latitude, longitude);
        console.log('🏷️ User location name:', locationName);
        
        setUserLocation({ latitude, longitude });
        setUserLocationName(locationName);
        
        setSelectedLocation(null);
        setSelectedLocationName('');
        
        if (map) {
          map.flyTo({
            center: [longitude, latitude],
            zoom: 14
          });

          console.log('🟥 Adding user location marker...');
          addUserLocationMarker(longitude, latitude, locationName);
          
          if (selectedLocationMarkerRef.current) {
            selectedLocationMarkerRef.current.remove();
            selectedLocationMarkerRef.current = null;
          }
        }

        const searchTerm = currentSearch.query || '';
        console.log('🔍 Searching videos at user location...');
        
        // SIN RADIO FIJO - búsqueda normal
        searchVideosByLocation(latitude, longitude, searchTerm);
        
        setMapLoading(false);
        showNotification(`🔍 Buscando videos en tu ubicación: ${locationName}`, 'success');
        console.log('=== ✅ GET USER LOCATION COMPLETED ===');
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación:', error);
        let errorMessage = 'Error obteniendo ubicación: ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permiso denegado. Por favor, permite el acceso a la ubicación.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Ubicación no disponible. Intenta en otro momento.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Tiempo de espera agotado. Intenta nuevamente.';
            break;
          default:
            errorMessage += 'Error desconocido.';
        }
        showNotification(errorMessage, 'error');
        setUserLocation(null);
        setUserLocationName('');
        setMapLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleActivateLocation = () => {
    getUserLocation();
  };

  const handleClearSelection = () => {
    console.log('🗑️ Clearing selected location');
    setSelectedLocation(null);
    setSelectedLocationName('');
    clearVideos();
    
    if (selectedLocationMarkerRef.current) {
      console.log('🗑️ Removing selected location marker');
      selectedLocationMarkerRef.current.remove();
      selectedLocationMarkerRef.current = null;
    }
    
    if (userLocation && map) {
      console.log('🟥 Restoring user location marker');
      addUserLocationMarker(userLocation.longitude, userLocation.latitude, userLocationName);
    }
    
    showNotification('📍 Ubicación seleccionada limpiada', 'info');
  };

  const handleClearSearchTerm = () => {
    closeSearch();
    
    if (selectedLocation) {
      searchVideosByLocation(selectedLocation.latitude, selectedLocation.longitude, '');
    } else if (userLocation) {
      searchVideosByLocation(userLocation.latitude, userLocation.longitude, '');
    }
    
    showNotification('🔍 Término de búsqueda limpiado', 'info');
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <h1>GeoTube</h1>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <span className="welcome-text">Hola, {user?.nombre || user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <div className="header-buttons">
              <button 
                className={`header-btn ${activeSection === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveSection('comments')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Comentarios
              </button>
              
              <button 
                className={`header-btn ${activeSection === 'history' ? 'active' : ''}`}
                onClick={() => setActiveSection('history')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Historial
              </button>
              
              <button 
                className={`header-btn ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20 21C20 19.6044 20 18.4067 19.8278 17.5C19.5772 16.2059 18.7941 15.4228 17.5 15.1722C16.5933 15 14.3956 15 13 15H11C9.60444 15 7.40673 15 6.5 15.1722C5.20589 15.4228 4.42282 16.2059 4.17221 17.5C4 18.4067 4 19.6044 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Perfil
              </button>
              
              <button className="header-btn logout" onClick={onLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              <span className="notification-message">{notification.message}</span>
              <button 
                className="notification-close"
                onClick={() => setNotification({ show: false, message: '', type: '' })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {message && <div className="message success">{message}</div>}
        
        {activeSection === 'dashboard' && (
          <DashboardContent
            userLocation={userLocation}
            selectedLocation={selectedLocation}
            userLocationName={userLocationName}
            selectedLocationName={selectedLocationName}
            mapLoading={mapLoading}
            showIntelligentSearch={showIntelligentSearch}
            showLocalVideos={showLocalVideos}
            youtubeLoading={youtubeLoading}
            youtubeError={youtubeError}
            videos={videos}
            currentSearch={currentSearch}
            mapContainer={mapContainer}
            mapboxToken={mapboxToken}
            onActivateLocation={handleActivateLocation}
            onClearSelection={handleClearSelection}
            onActivateIntelligentSearch={handleActivateIntelligentSearch}
            onActivateLocalVideos={handleActivateLocalVideos}
            onVideoClick={handleVideoClick}
            onClearSearchTerm={handleClearSearchTerm}
            searchVideosByLocation={searchVideosByLocation}
            onIntelligentSearch={handleIntelligentSearch}
            onSearchAroundMe={handleSearchAroundMe}
            onDiscoverLocalVideos={handleDiscoverLocalVideos}
            onCloseIntelligentSearch={() => setShowIntelligentSearch(false)}
            onCloseLocalVideos={() => setShowLocalVideos(false)}
          />
        )}

        {activeSection === 'profile' && (
          <ProfileSection 
            user={user} 
            profileData={profileData}
            setProfileData={setProfileData}
            isGoogleUser={isGoogleUser}
            onBack={() => setActiveSection('dashboard')}
          />
        )}

        {activeSection === 'comments' && (
          <CommentsSection 
            user={user}
            onBack={() => setActiveSection('dashboard')}
          />
        )}

        {activeSection === 'history' && (
          <HistorySection 
            user={user}
            onBack={() => setActiveSection('dashboard')}
          />
        )}
        
        <VideoPlayer 
          video={selectedVideo}
          isOpen={showVideoPlayer}
          onClose={() => setShowVideoPlayer(false)}
          user={user}
        />
      </main>
    </div>
  );
};

const DashboardContent = ({
  userLocation,
  selectedLocation,
  userLocationName,
  selectedLocationName,
  mapLoading,
  showIntelligentSearch,
  showLocalVideos,
  youtubeLoading,
  youtubeError,
  videos,
  currentSearch,
  mapContainer,
  mapboxToken,
  onActivateLocation,
  onClearSelection,
  onActivateIntelligentSearch,
  onActivateLocalVideos,
  onVideoClick,
  onClearSearchTerm,
  searchVideosByLocation,
  onIntelligentSearch,
  onSearchAroundMe,
  onDiscoverLocalVideos,
  onCloseIntelligentSearch,
  onCloseLocalVideos
}) => {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <div className="welcome-card">
          <h2>Bienvenido a GeoTube</h2>
          <p>Descubre videos de YouTube basados en ubicaciones geográficas específicas</p>
          
          {currentSearch.query && (
            <div className="current-search-banner">
              <div className="search-info">
                <span className="search-label">Búsqueda activa:</span>
                <span className="search-term">"{currentSearch.query}"</span>
              </div>
              <button 
                className="clear-search-btn"
                onClick={onClearSearchTerm}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cerrar búsqueda
              </button>
            </div>
          )}

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#F59E0B"/>
                </svg>
              </div>
              <div className="feature-content">
                <h3>Videos por Región</h3>
                <p>Descubre contenido específico de diferentes países y ciudades</p>
                <button 
                  className="feature-btn"
                  onClick={onActivateLocalVideos}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Explorar Regiones
                </button>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#10B981"/>
                  <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" fill="#10B981"/>
                </svg>
              </div>
              <div className="feature-content">
                <h3>Búsqueda Inteligente</h3>
                <p>Búsqueda avanzada con filtros por radio y términos específicos</p>
                <button 
                  className="feature-btn"
                  onClick={onActivateIntelligentSearch}
                  disabled={!selectedLocation && !userLocation}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  Búsqueda Avanzada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-video-container">
        <div className="map-section">
          <div className="map-container">
            <div className="map-header">
              <h3>Mapa Interactivo</h3>
              <div className="map-controls">
                <button 
                  className="location-btn"
                  onClick={onActivateLocation}
                  disabled={!mapboxToken || mapLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {mapLoading ? 'Cargando...' : userLocation ? 'Mi Ubicación' : 'Activar Ubicación'}
                </button>
                
                {selectedLocation && (
                  <button 
                    className="clear-btn"
                    onClick={onClearSelection}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Limpiar Selección
                  </button>
                )}
              </div>
            </div>

            {showIntelligentSearch && (
              <IntelligentSearch
                selectedLocation={selectedLocation}
                userLocation={userLocation}
                currentSearch={currentSearch}
                onSearch={onIntelligentSearch}
                onSearchAroundMe={onSearchAroundMe}
                loading={youtubeLoading}
                onClose={onCloseIntelligentSearch}
              />
            )}

            {showLocalVideos && (
              <LocalVideos
                onSelectRegion={onDiscoverLocalVideos}
                onClose={onCloseLocalVideos}
              />
            )}
            
            {mapLoading && (
              <div className="map-loading">
                Cargando mapa...
              </div>
            )}
            
            <div 
              ref={mapContainer} 
              className="mapbox-container"
            />
            
            {!mapboxToken && (
              <div className="map-error">
                <p>Error: Token de Mapbox no configurado</p>
              </div>
            )}
          </div>
        </div>

        <div className="videos-section">
          <div className="videos-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                {selectedLocation 
                  ? (currentSearch.query 
                      ? <>Videos de <span className="highlight">"{currentSearch.query}"</span> en {selectedLocationName}</>
                      : <>Videos de {selectedLocationName}</>)
                  : userLocation
                    ? <>Videos de {userLocationName}</>
                    : 'Selecciona una Ubicación'
                }
              </h3>
              <div className="location-info-badge">
                {selectedLocation && (
                  <div className="location-info selected">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Ubicación seleccionada: {selectedLocationName}
                  </div>
                )}
                {userLocation && !selectedLocation && (
                  <div className="location-info current">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Tu ubicación actual: {userLocationName}
                  </div>
                )}
              </div>
            </div>

            <div className="panel-content">
              {youtubeLoading ? (
                <div className="videos-loading">
                  <div className="loading-spinner"></div>
                  <p>
                    {currentSearch.query 
                      ? `Buscando "${currentSearch.query}" en esta ubicación...` 
                      : 'Buscando videos en esta ubicación...'
                    }
                  </p>
                </div>
              ) : youtubeError ? (
                <div className="videos-error">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#EF4444">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p>{youtubeError}</p>
                  <button 
                    className="retry-btn"
                    onClick={() => {
                      if (selectedLocation) {
                        searchVideosByLocation(
                          selectedLocation.latitude, 
                          selectedLocation.longitude, 
                          currentSearch.query
                        );
                      } else if (userLocation) {
                        searchVideosByLocation(
                          userLocation.latitude, 
                          userLocation.longitude, 
                          currentSearch.query
                        );
                      }
                    }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : videos.length > 0 ? (
                <div className="video-list">
                  {videos.map(video => (
                    <div 
                      key={video.id} 
                      className="video-item"
                      onClick={() => onVideoClick(video)}
                    >
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="video-thumbnail" 
                      />
                      <div className="video-info">
                        <h4 className="video-title">{video.title}</h4>
                        <p className="video-channel">{video.channelTitle}</p>
                        <div className="video-meta">
                          <span className="video-date">
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </span>
                          {video.location.name && (
                            <span className="video-location">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              {video.location.name.split(',')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedLocation ? (
                <div className="videos-empty">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#9CA3AF">
                      <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </div>
                  <p>
                    {currentSearch.query 
                      ? `No se encontraron videos sobre "${currentSearch.query}" en ${selectedLocationName}`
                      : `No se encontraron videos específicos para ${selectedLocationName}`
                    }
                  </p>
                  <p>Intenta con otros términos de búsqueda</p>
                </div>
              ) : userLocation ? (
                <div className="videos-empty">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#9CA3AF">
                      <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </div>
                  <p>No se encontraron videos específicos para {userLocationName}</p>
                  <p>Selecciona una ubicación en el mapa o usa la búsqueda avanzada</p>
                </div>
              ) : (
                <div className="videos-placeholder">
                  <div className="placeholder-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#9CA3AF">
                      <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </div>
                  <h4>Selecciona una ubicación en el mapa</h4>
                  <p>Haz click en cualquier lugar del mapa para descubrir videos específicos de esa región</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;