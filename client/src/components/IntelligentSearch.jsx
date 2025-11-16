// src/components/IntelligentSearch.jsx
import React, { useState, useEffect } from 'react';
import './IntelligentSearch.css';

const IntelligentSearch = ({ 
  selectedLocation, 
  userLocation, 
  currentSearch,
  onSearch, 
  onSearchAroundMe, 
  loading = false,
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRadius, setSearchRadius] = useState(10); // Valor por defecto en km

  // Inicializar con los valores de currentSearch si existen
  useEffect(() => {
    if (currentSearch?.query) {
      setSearchQuery(currentSearch.query);
    }
    if (currentSearch?.radius) {
      // Convertir metros a kilómetros para el slider
      setSearchRadius(currentSearch.radius / 1000);
    } else {
      // Si no hay radio en currentSearch, usar 10km por defecto
      setSearchRadius(10);
    }
  }, [currentSearch]);

  // Función para validar ubicación
  const isValidLocation = (location) => {
    return location && 
           typeof location.latitude === 'number' && 
           typeof location.longitude === 'number' &&
           !isNaN(location.latitude) && 
           !isNaN(location.longitude) &&
           Math.abs(location.latitude) <= 90 &&
           Math.abs(location.longitude) <= 180;
  };

  // Manejar búsqueda inteligente en ubicación seleccionada
  const handleIntelligentSearch = () => {
    const locationToUse = selectedLocation;
    
    if (!isValidLocation(locationToUse)) {
      alert('Por favor, selecciona una ubicación válida en el mapa primero');
      return;
    }

    if (!searchQuery.trim()) {
      alert('Por favor, escribe un término de búsqueda');
      return;
    }

    const query = searchQuery.trim();
    const radius = searchRadius * 1000; // convertir a metros
    
    console.log(`Búsqueda inteligente por ubicación específica:`, {
      query: query,
      location: locationToUse,
      radius: `${radius}m (${searchRadius}km)`
    });
    
    onSearch(locationToUse.latitude, locationToUse.longitude, query, radius);
  };

  // Manejar búsqueda alrededor de mi ubicación
  const handleSearchAroundMe = () => {
    if (!isValidLocation(userLocation)) {
      alert('Activa tu ubicación primero o selecciona una ubicación en el mapa');
      return;
    }

    if (!searchQuery.trim()) {
      alert('Por favor, escribe un término de búsqueda');
      return;
    }

    const query = searchQuery.trim();
    const radius = searchRadius * 1000;
    
    console.log(`Búsqueda alrededor de mi ubicación:`, {
      query: query,
      location: userLocation,
      radius: `${radius}m (${searchRadius}km)`
    });
    
    onSearchAroundMe(userLocation.latitude, userLocation.longitude, query, radius);
  };

  // Sugerencias de búsqueda rápida con íconos
  const quickSuggestions = [
    { 
      label: 'Comida', 
      query: 'comida',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 10H21M5 10V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V10M8 5V3C8 2.44772 8.44772 2 9 2H15C15.5523 2 16 2.44772 16 3V5" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 5H18V7C18 8.10457 17.1046 9 16 9H8C6.89543 9 6 8.10457 6 7V5Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      label: 'Turismo', 
      query: 'turismo',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 10.5C21 17 12 23 12 23C12 23 3 17 3 10.5C3 5 7 1 12 1C17 1 21 5 21 10.5Z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="10.5" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      label: 'Eventos', 
      query: 'eventos',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M16 2V6M8 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      label: 'Música', 
      query: 'música',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5L21 3V16M9 18C9 19.1046 8.10457 20 7 20C5.89543 20 5 19.1046 5 18C5 16.8954 5.89543 16 7 16C8.10457 16 9 16.8954 9 18ZM21 16C21 17.1046 20.1046 18 19 18C17.8954 18 17 17.1046 17 16C17 14.8954 17.8954 14 19 14C20.1046 14 21 14.8954 21 16Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      label: 'Deportes', 
      query: 'deportes',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M17 2L22 7M22 7L17 12M22 7H12C8.13401 7 5 10.134 5 14V22" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      label: 'Arte', 
      query: 'arte',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 10H22M8 14H16" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  const handleQuickSuggestion = (suggestionQuery) => {
    setSearchQuery(suggestionQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Determinar si los botones deben estar habilitados
  const isSearchAroundMeEnabled = isValidLocation(userLocation) && searchQuery.trim();
  const isLocationSearchEnabled = isValidLocation(selectedLocation) && searchQuery.trim();

  return (
    <div className="intelligent-search-overlay">
      <div className="intelligent-search-modal">
        <div className="intelligent-search-header">
          <h2>Búsqueda Inteligente por Ubicación</h2>
          <p>Encuentra videos subidos específicamente en esta ubicación</p>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className="intelligent-search-content">
          {/* Campo de búsqueda personalizada */}
          <div className="search-section">
            <div className="search-input-group">
              <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Ej: pizza, museos, playas, festivales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-input-btn" onClick={clearSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="search-hint">
              Escribe lo que quieres buscar en esta ubicación específica
            </div>
          </div>

          {/* Sugerencias rápidas */}
          <div className="quick-search-section">
            <h3>Sugerencias Rápidas</h3>
            <div className="quick-search-tags">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="quick-tag"
                  onClick={() => handleQuickSuggestion(suggestion.query)}
                >
                  <span className="tag-icon">{suggestion.icon}</span>
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radio de búsqueda - AHORA CON VALOR POR DEFECTO CLARO */}
          <div className="radius-section">
            <h3>Radio de Búsqueda</h3>
            <div className="radius-controls">
              <div className="radius-slider-container">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="radius-slider"
                />
                <div className="radius-labels">
                  <span>1 km</span>
                  <span>50 km</span>
                  <span>100 km</span>
                </div>
              </div>
              <div className="radius-display">
                <span className="radius-value">{searchRadius} km</span>
                <span className="radius-description">
                  {searchRadius <= 5 ? 'Búsqueda muy local (recomendado)' : 
                   searchRadius <= 25 ? 'Búsqueda en la ciudad' : 
                   searchRadius <= 50 ? 'Búsqueda regional' : 
                   'Búsqueda en área amplia'}
                </span>
                <div className="radius-note">
                  <small>Radio actual seleccionado: {searchRadius}km</small>
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa de la consulta - ACTUALIZADA CON RADIO REAL */}
          <div className="query-preview-section">
            <div className="query-preview">
              <span className="query-label">Búsqueda que se realizará:</span>
              <span className="query-text">"{searchQuery}"</span>
              <span className="query-radius">en un radio de {searchRadius}km</span>
            </div>
          </div>

          {/* Información de ubicación */}
          <div className="location-info-section">
            {isValidLocation(selectedLocation) && (
              <div className="location-card selected-location">
                <div className="location-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="location-info">
                  <div className="location-title">Ubicación seleccionada en el mapa</div>
                  <div className="location-coordinates">
                    Lat: {selectedLocation.latitude.toFixed(4)}, Lng: {selectedLocation.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            )}
            {isValidLocation(userLocation) && (
              <div className="location-card user-location">
                <div className="location-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="location-info">
                  <div className="location-title">Tu ubicación actual disponible</div>
                  <div className="location-description">Puedes buscar alrededor de tu posición</div>
                </div>
              </div>
            )}
            {!isValidLocation(selectedLocation) && !isValidLocation(userLocation) && (
              <div className="location-card no-location">
                <div className="location-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="location-info">
                  <div className="location-title">Selecciona una ubicación</div>
                  <div className="location-description">Haz click en el mapa o activa tu ubicación</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acciones - ACTUALIZADO CON RADIO REAL */}
        <div className="intelligent-search-actions">
          <div className="actions-info">
            {(isValidLocation(selectedLocation) || isValidLocation(userLocation)) && searchQuery && (
              <div className="selected-info">
                <span className="info-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                <span>
                  Buscando "{searchQuery}" en {searchRadius}km alrededor de {isValidLocation(selectedLocation) ? 'la ubicación seleccionada' : 'tu ubicación'}
                </span>
              </div>
            )}
          </div>
          
          <div className="actions-buttons">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            
            <div className="search-buttons">
              {isValidLocation(userLocation) && (
                <button 
                  className="search-around-btn"
                  onClick={handleSearchAroundMe}
                  disabled={loading || !isSearchAroundMeEnabled}
                >
                  <span className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C12 22 20 16 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 16 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                  Buscar alrededor de mí ({searchRadius}km)
                </button>
              )}
              
              <button 
                className="confirm-search-btn"
                onClick={handleIntelligentSearch}
                disabled={!isValidLocation(selectedLocation) || loading || !isLocationSearchEnabled}
              >
                <span className="btn-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                          stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                {loading ? 'Buscando...' : `Buscar en Ubicación (${searchRadius}km)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentSearch;