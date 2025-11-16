// src/components/LocalVideos.jsx
import React, { useState, useEffect } from 'react';
import './LocalVideos.css';

const LocalVideos = ({ onSelectRegion, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [currentCountry, setCurrentCountry] = useState(null);

  // Base de datos de países y sus regiones
  const countriesData = {
    'méxico': {
      name: 'México',
      regions: [
        { name: 'Ciudad de México', lat: 19.4326, lng: -99.1332, query: 'ciudad de mexico cdmx' },
        { name: 'Cancún', lat: 21.1619, lng: -86.8515, query: 'cancun quintana roo playa' },
        { name: 'Guadalajara', lat: 20.6597, lng: -103.3496, query: 'guadalajara jalisco' },
        { name: 'Monterrey', lat: 25.6866, lng: -100.3161, query: 'monterrey nuevo leon' },
        { name: 'Tijuana', lat: 32.5149, lng: -117.0382, query: 'tijuana baja california' },
        { name: 'Puebla', lat: 19.0414, lng: -98.2063, query: 'puebla puebla' },
        { name: 'Oaxaca', lat: 17.0732, lng: -96.7266, query: 'oaxaca cultura' },
        { name: 'Chiapas', lat: 16.7569, lng: -93.1292, query: 'chiapas naturaleza' },
        { name: 'Yucatán', lat: 20.9801, lng: -89.6234, query: 'yucatan merida' },
        { name: 'Jalisco', lat: 20.6597, lng: -103.3496, query: 'jalisco tequila' }
      ]
    },
    'colombia': {
      name: 'Colombia',
      regions: [
        { name: 'Bogotá', lat: 4.7110, lng: -74.0721, query: 'bogota colombia' },
        { name: 'Medellín', lat: 6.2442, lng: -75.5812, query: 'medellin antioquia' },
        { name: 'Cali', lat: 3.4516, lng: -76.5320, query: 'cali valle' },
        { name: 'Cartagena', lat: 10.3910, lng: -75.4794, query: 'cartagena caribe' },
        { name: 'Barranquilla', lat: 10.9639, lng: -74.7964, query: 'barranquilla atlantico' }
      ]
    },
    'españa': {
      name: 'España',
      regions: [
        { name: 'Madrid', lat: 40.4168, lng: -3.7038, query: 'madrid españa' },
        { name: 'Barcelona', lat: 41.3851, lng: 2.1734, query: 'barcelona catalunya' },
        { name: 'Valencia', lat: 39.4699, lng: -0.3763, query: 'valencia españa' },
        { name: 'Sevilla', lat: 37.3891, lng: -5.9845, query: 'sevilla andalucia' },
        { name: 'Bilbao', lat: 43.2630, lng: -2.9350, query: 'bilbao pais vasco' }
      ]
    },
    'argentina': {
      name: 'Argentina',
      regions: [
        { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, query: 'buenos aires argentina' },
        { name: 'Córdoba', lat: -31.4201, lng: -64.1888, query: 'cordoba argentina' },
        { name: 'Mendoza', lat: -32.8895, lng: -68.8458, query: 'mendoza vino' },
        { name: 'Rosario', lat: -32.9468, lng: -60.6393, query: 'rosario santa fe' },
        { name: 'Bariloche', lat: -41.1335, lng: -71.3103, query: 'bariloche patagonia' }
      ]
    },
    'brasil': {
      name: 'Brasil',
      regions: [
        { name: 'Río de Janeiro', lat: -22.9068, lng: -43.1729, query: 'rio de janeiro' },
        { name: 'São Paulo', lat: -23.5505, lng: -46.6333, query: 'sao paulo brasil' },
        { name: 'Brasilia', lat: -15.7975, lng: -47.8919, query: 'brasilia capital' },
        { name: 'Salvador', lat: -12.9714, lng: -38.5014, query: 'salvador bahia' },
        { name: 'Fortaleza', lat: -3.7319, lng: -38.5267, query: 'fortaleza playa' }
      ]
    },
    'perú': {
      name: 'Perú',
      regions: [
        { name: 'Lima', lat: -12.0464, lng: -77.0428, query: 'lima peru' },
        { name: 'Cusco', lat: -13.5320, lng: -71.9675, query: 'cusco machu picchu' },
        { name: 'Arequipa', lat: -16.4090, lng: -71.5375, query: 'arequipa peru' },
        { name: 'Trujillo', lat: -8.1092, lng: -79.0215, query: 'trujillo norte' },
        { name: 'Iquitos', lat: -3.7491, lng: -73.2538, query: 'iquitos amazonas' }
      ]
    },
    'chile': {
      name: 'Chile',
      regions: [
        { name: 'Santiago', lat: -33.4489, lng: -70.6693, query: 'santiago chile' },
        { name: 'Valparaíso', lat: -33.0472, lng: -71.6127, query: 'valparaiso puerto' },
        { name: 'Concepción', lat: -36.8201, lng: -73.0444, query: 'concepcion chile' },
        { name: 'La Serena', lat: -29.9027, lng: -71.2519, query: 'la serena norte' },
        { name: 'Puerto Montt', lat: -41.4689, lng: -72.9411, query: 'puerto montt sur' }
      ]
    }
  };

  // Colores para las regiones
  const regionColors = [
    '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4',
    '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6'
  ];

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setCurrentCountry(null);
      setFilteredRegions([]);
      return;
    }

    // Buscar el país que coincide con la búsqueda
    const countryKey = Object.keys(countriesData).find(key => 
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      countriesData[key].name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (countryKey) {
      setCurrentCountry(countriesData[countryKey]);
      
      // Si hay más texto después del país, filtrar regiones
      const countryName = countriesData[countryKey].name.toLowerCase();
      const searchWithoutCountry = searchTerm.toLowerCase().replace(countryName, '').trim();
      
      if (searchWithoutCountry) {
        const filtered = countriesData[countryKey].regions.filter(region =>
          region.name.toLowerCase().includes(searchWithoutCountry) ||
          region.query.toLowerCase().includes(searchWithoutCountry)
        );
        setFilteredRegions(filtered);
      } else {
        setFilteredRegions(countriesData[countryKey].regions);
      }
    } else {
      setCurrentCountry(null);
      setFilteredRegions([]);
    }
  }, [searchTerm]);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  };

  const handleSearch = () => {
    if (selectedRegion) {
      onSelectRegion(selectedRegion);
    } else if (searchTerm.trim() && !currentCountry) {
      // Búsqueda personalizada si no se encontró un país
      const customRegion = {
        name: searchTerm,
        lat: 19.4326, // Coordenadas por defecto (CDMX)
        lng: -99.1332,
        query: searchTerm.toLowerCase(),
        isCustom: true
      };
      onSelectRegion(customRegion);
    }
  };

  const getRegionColor = (index) => {
    return regionColors[index % regionColors.length];
  };

  return (
    <div className="local-videos-overlay">
      <div className="local-videos-modal">
        <div className="local-videos-header">
          <h2>Descubre Videos por Ubicación</h2>
          <p>Escribe un país para ver sus regiones disponibles</p>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className="local-videos-content">
          {/* Búsqueda principal */}
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
                placeholder="Escribe un país (México, Colombia, España, Argentina...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Sugerencias de países */}
            {searchTerm && !currentCountry && (
              <div className="country-suggestions">
                <p>Países disponibles:</p>
                <div className="suggestion-tags">
                  {Object.keys(countriesData)
                    .filter(countryKey => 
                      countryKey.includes(searchTerm.toLowerCase()) ||
                      countriesData[countryKey].name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(countryKey => (
                      <button
                        key={countryKey}
                        className="suggestion-tag"
                        onClick={() => setSearchTerm(countriesData[countryKey].name)}
                      >
                        {countriesData[countryKey].name}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Información del país encontrado */}
          {currentCountry && (
            <div className="country-info">
              <h3>
                <span className="country-flag">📍</span>
                {currentCountry.name}
              </h3>
              <p>Selecciona una región para explorar sus videos:</p>
            </div>
          )}

          {/* Lista de regiones */}
          {currentCountry && filteredRegions.length > 0 && (
            <div className="regions-section">
              <div className="regions-grid">
                {filteredRegions.map((region, index) => (
                  <div
                    key={`${region.name}-${index}`}
                    className={`region-card ${selectedRegion?.name === region.name ? 'selected' : ''}`}
                    onClick={() => handleRegionSelect(region)}
                    style={{ borderLeftColor: getRegionColor(index) }}
                  >
                    <div className="region-image">
                      <div 
                        className="region-image-placeholder"
                        style={{ backgroundColor: getRegionColor(index) + '20' }}
                      >
                        <span style={{ color: getRegionColor(index) }}>
                          {region.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="region-info">
                      <h3>{region.name}</h3>
                      <div className="region-coordinates">
                        <span>Lat: {region.lat.toFixed(4)}</span>
                        <span>Lng: {region.lng.toFixed(4)}</span>
                      </div>
                    </div>
                    <div className="region-selector">
                      <div className="selection-indicator">
                        {selectedRegion?.name === region.name && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {searchTerm && !currentCountry && (
            <div className="no-results">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                      stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h4>País no encontrado</h4>
              <p>Intenta con: México, Colombia, España, Argentina, Brasil, Perú, Chile</p>
            </div>
          )}

          {/* Acciones */}
          <div className="local-videos-actions">
            <div className="selection-info">
              {selectedRegion && (
                <div className="selected-region-info">
                  <strong>Región seleccionada:</strong> {selectedRegion.name}
                  {currentCountry && `, ${currentCountry.name}`}
                </div>
              )}
              {searchTerm && !selectedRegion && !currentCountry && (
                <div className="selected-region-info">
                  <strong>Búsqueda personalizada:</strong> {searchTerm}
                </div>
              )}
            </div>
            
            <div className="selection-actions">
              <button className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button 
                className="confirm-btn"
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                {selectedRegion ? `Explorar ${selectedRegion.name}` : 'Buscar Videos'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalVideos;