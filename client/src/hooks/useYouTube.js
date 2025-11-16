// src/hooks/useYouTube.js
import { useState } from 'react';

export const useYouTube = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearch, setCurrentSearch] = useState({
    query: null,
    location: null,
    radius: null,
    type: null // 'current_location', 'selected_location', 'area_videos'
  });

  // Validar coordenadas
  const isValidCoordinates = (latitude, longitude) => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return false;
    }
    if (isNaN(latitude) || isNaN(longitude)) {
      return false;
    }
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  };

  // Normalizar coordenadas
  const normalizeCoordinates = (latitude, longitude) => {
    return {
      latitude: parseFloat(Number(latitude).toFixed(6)),
      longitude: parseFloat(Number(longitude).toFixed(6))
    };
  };

  // Determinar ubicación aproximada basada en coordenadas
  const getLocationFromCoordinates = (latitude, longitude) => {
    console.log('📍 Determinando ubicación para:', { latitude, longitude });

    // México - Estados y ciudades principales
    if (longitude >= -118.4 && longitude <= -86.7 && latitude >= 14.5 && latitude <= 32.7) {
      // CDMX y área metropolitana
      if (latitude >= 19.0 && latitude <= 20.0 && longitude >= -99.3 && longitude <= -98.9) {
        return { city: 'Ciudad de México', region: 'CDMX', country: 'México' };
      }
      // Guadalajara, Jalisco
      if (latitude >= 20.5 && latitude <= 21.5 && longitude >= -103.5 && longitude <= -102.5) {
        return { city: 'Guadalajara', region: 'Jalisco', country: 'México' };
      }
      // Monterrey, Nuevo León
      if (latitude >= 25.5 && latitude <= 26.5 && longitude >= -100.5 && longitude <= -99.5) {
        return { city: 'Monterrey', region: 'Nuevo León', country: 'México' };
      }
      // Puebla
      if (latitude >= 18.9 && latitude <= 19.2 && longitude >= -98.3 && longitude <= -97.9) {
        return { city: 'Puebla', region: 'Puebla', country: 'México' };
      }
      // Oaxaca
      if (latitude >= 17.0 && latitude <= 17.2 && longitude >= -96.8 && longitude <= -96.5) {
        return { city: 'Oaxaca', region: 'Oaxaca', country: 'México' };
      }
      // Veracruz
      if (latitude >= 19.1 && latitude <= 19.3 && longitude >= -96.3 && longitude <= -96.0) {
        return { city: 'Veracruz', region: 'Veracruz', country: 'México' };
      }
      // Chiapas
      if (latitude >= 16.7 && latitude <= 17.0 && longitude >= -93.2 && longitude <= -92.5) {
        return { city: 'Tuxtla Gutiérrez', region: 'Chiapas', country: 'México' };
      }
      return { city: 'Ubicación en México', region: 'México', country: 'México' };
    }

    // Estados Unidos
    if (longitude >= -125.0 && longitude <= -66.9 && latitude >= 24.5 && latitude <= 49.4) {
      return { city: 'Ubicación en USA', region: 'Estados Unidos', country: 'Estados Unidos' };
    }

    // España
    if (longitude >= -18.2 && longitude <= 4.3 && latitude >= 27.6 && latitude <= 43.8) {
      return { city: 'Ubicación en España', region: 'España', country: 'España' };
    }

    // Colombia
    if (longitude >= -79.0 && longitude <= -66.9 && latitude >= -4.2 && latitude <= 12.5) {
      return { city: 'Ubicación en Colombia', region: 'Colombia', country: 'Colombia' };
    }

    // Argentina
    if (longitude >= -73.6 && longitude <= -53.6 && latitude >= -55.1 && latitude <= -21.8) {
      return { city: 'Ubicación en Argentina', region: 'Argentina', country: 'Argentina' };
    }

    // Brasil
    if (longitude >= -73.9 && longitude <= -34.7 && latitude >= -33.7 && latitude <= 5.3) {
      return { city: 'Ubicación en Brasil', region: 'Brasil', country: 'Brasil' };
    }

    // Ubicación genérica
    return { city: 'Ubicación actual', region: 'Área local', country: 'Región' };
  };

  // Obtener información de ubicación
  const getDetailedLocationInfo = async (latitude, longitude, locationType = 'selected') => {
    try {
      const normalized = normalizeCoordinates(latitude, longitude);
      latitude = normalized.latitude;
      longitude = normalized.longitude;

      console.log(`📍 Obteniendo información de ubicación (${locationType}):`, { latitude, longitude });

      const locationData = getLocationFromCoordinates(latitude, longitude);
      
      let fullName;
      if (locationType === 'current') {
        fullName = `Mi ubicación: ${locationData.city}, ${locationData.region}`;
      } else if (locationType === 'selected') {
        fullName = `Ubicación seleccionada: ${locationData.city}, ${locationData.region}`;
      } else {
        fullName = `${locationData.city}, ${locationData.region}, ${locationData.country}`;
      }

      console.log('✅ Información de ubicación:', {
        ...locationData,
        fullName,
        type: locationType
      });

      return {
        ...locationData,
        fullName,
        coordinates: { latitude, longitude },
        locationType: locationType,
        source: 'coordinates_based'
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo información de ubicación:', error);
      
      return {
        city: 'Ubicación actual',
        region: 'Área local',
        country: 'México',
        fullName: 'Ubicación actual',
        coordinates: { latitude, longitude },
        locationType: 'fallback',
        source: 'emergency_fallback'
      };
    }
  };

  // Construir consultas optimizadas para ubicación
  const buildLocationSpecificQueries = (query, locationInfo, searchType) => {
    const queries = [];
    
    // Consultas específicas para ubicación actual
    if (searchType === 'current_location') {
      if (query && query.trim() !== '') {
        // Búsqueda específica en mi ubicación
        queries.push(`${query} ${locationInfo.city} ${locationInfo.region}`);
        queries.push(`${query} en ${locationInfo.city}`);
        queries.push(`${query} cerca de mi ubicación`);
        queries.push(`${query} local`);
      } else {
        // Contenido local de mi área
        queries.push(`noticias ${locationInfo.city} hoy`);
        queries.push(`eventos ${locationInfo.city}`);
        queries.push(`qué pasa en ${locationInfo.city}`);
        queries.push(`videos locales ${locationInfo.region}`);
        queries.push(`actualidad ${locationInfo.city}`);
      }
    }
    // Consultas para ubicación seleccionada
    else if (searchType === 'selected_location') {
      if (query && query.trim() !== '') {
        // Búsqueda específica en ubicación seleccionada
        queries.push(`${query} ${locationInfo.city} ${locationInfo.region}`);
        queries.push(`${query} en ${locationInfo.city} ${locationInfo.region}`);
        queries.push(`${query} ${locationInfo.region} México`);
      } else {
        // Descubrir contenido de la ubicación seleccionada
        queries.push(`${locationInfo.city} noticias eventos`);
        queries.push(`videos ${locationInfo.city} ${locationInfo.region}`);
        queries.push(`qué hacer en ${locationInfo.city}`);
        queries.push(`turismo ${locationInfo.city}`);
      }
    }
    // Consultas para videos del área (más genéricas)
    else {
      if (query && query.trim() !== '') {
        queries.push(`${query} ${locationInfo.region}`);
        queries.push(`${query} México`);
        queries.push(`${query} noticias`);
      } else {
        queries.push(`videos ${locationInfo.region}`);
        queries.push(`noticias ${locationInfo.region} hoy`);
        queries.push(`tendencias ${locationInfo.country}`);
        queries.push('videos virales hoy');
      }
    }

    // Siempre incluir consultas de respaldo
    const backupQueries = [
      'noticias hoy',
      'videos virales',
      'actualidad',
      'tendencias'
    ];

    // Combinar y eliminar duplicados
    const allQueries = [...queries, ...backupQueries];
    return [...new Set(allQueries)];
  };

  // Buscar videos en YouTube
  const searchYouTube = async (searchQuery, originalQuery, latitude, longitude, locationInfo, searchType) => {
    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    if (!youtubeApiKey) {
      throw new Error('YouTube API key no configurada');
    }

    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      q: searchQuery,
      maxResults: '20',
      order: 'relevance',
      videoDuration: 'any',
      key: youtubeApiKey
    });

    console.log(`🔍 Buscando en YouTube (${searchType}): "${searchQuery}"`);

    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No se encontraron videos');
      }

      console.log(`✅ Encontrados ${data.items.length} videos con: "${searchQuery}"`);

      const videosWithLocation = data.items.map(video => ({
        id: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        location: {
          latitude,
          longitude,
          name: locationInfo.fullName,
          searchQuery: originalQuery || 'contenido local',
          searchType: searchType,
          city: locationInfo.city,
          region: locationInfo.region,
          country: locationInfo.country,
          searchString: searchQuery,
          source: locationInfo.source
        }
      }));

      return videosWithLocation;
    } catch (error) {
      throw error;
    }
  };

  // Estrategia de búsqueda principal
  const executeSearchStrategy = async (query, latitude, longitude, locationInfo, searchType) => {
    try {
      const searchQueries = buildLocationSpecificQueries(query, locationInfo, searchType);
      
      console.log(`🎯 Probando consultas (${searchType}):`, searchQueries);

      // Probar cada consulta en orden
      for (const searchQuery of searchQueries) {
        try {
          const videos = await searchYouTube(searchQuery, query, latitude, longitude, locationInfo, searchType);
          if (videos && videos.length > 0) {
            console.log(`🎉 Éxito con (${searchType}): "${searchQuery}" - ${videos.length} videos`);
            return videos;
          }
        } catch (error) {
          console.log(`❌ Consulta fallida (${searchType}): "${searchQuery}"`);
          continue;
        }
      }
      
      throw new Error('No se encontraron videos para los criterios de búsqueda');
      
    } catch (error) {
      console.error(`❌ Error en búsqueda (${searchType}):`, error);
      throw error;
    }
  };

  // FUNCIÓN PRINCIPAL MEJORADA
  const searchVideosByLocation = async (latitude, longitude, query = null, searchType = 'selected_location') => {
    // Validaciones
    if (latitude === undefined || longitude === undefined) {
      setError('Error: No se proporcionaron coordenadas');
      return;
    }

    const normalized = normalizeCoordinates(latitude, longitude);
    latitude = normalized.latitude;
    longitude = normalized.longitude;

    console.log('=== 🚀 INICIANDO BÚSQUEDA ===');
    console.log('📍 Coordenadas:', { latitude, longitude });
    console.log('🔍 Consulta:', query || '(contenido local)');
    console.log('🎯 Tipo de búsqueda:', searchType);

    if (!isValidCoordinates(latitude, longitude)) {
      setError('Las coordenadas de ubicación no son válidas');
      return;
    }

    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      setError('Error: No se encontró la API key de YouTube');
      return;
    }

    setLoading(true);
    setError(null);
    setVideos([]);

    try {
      const searchQuery = query || '';
      
      // Determinar el tipo de ubicación para la búsqueda
      const locationType = searchType === 'current_location' ? 'current' : 'selected';
      const locationInfo = await getDetailedLocationInfo(latitude, longitude, locationType);
      
      setCurrentSearch({
        query: searchQuery.trim() !== '' ? searchQuery : null,
        location: { latitude, longitude },
        radius: null,
        type: searchType
      });

      console.log('🎬 Ejecutando búsqueda...');
      const foundVideos = await executeSearchStrategy(searchQuery, latitude, longitude, locationInfo, searchType);
      
      if (foundVideos.length === 0) {
        throw new Error('No se encontraron videos para esta ubicación');
      }

      setVideos(foundVideos);
      console.log(`✅ BÚSQUEDA EXITOSA (${searchType}): ${foundVideos.length} videos`);
      
    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      
      let userMessage;
      if (searchType === 'current_location') {
        userMessage = `No se encontraron videos en tu ubicación actual${query ? ` sobre "${query}"` : ''}. Intenta seleccionar una ubicación en el mapa.`;
      } else if (searchType === 'selected_location') {
        userMessage = `No se encontraron videos en la ubicación seleccionada${query ? ` sobre "${query}"` : ''}. Intenta con otros términos o selecciona otra ubicación.`;
      } else {
        userMessage = `No se encontraron videos${query ? ` sobre "${query}"` : ''} en esta área.`;
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda en mi ubicación actual
  const searchCurrentLocationVideos = async (query = null) => {
    return searchVideosByLocation(currentSearch.location?.latitude, currentSearch.location?.longitude, query, 'current_location');
  };

  // Búsqueda en ubicación seleccionada
  const searchSelectedLocationVideos = async (latitude, longitude, query = null) => {
    return searchVideosByLocation(latitude, longitude, query, 'selected_location');
  };

  // Búsqueda de videos del área
  const searchAreaVideos = async (latitude, longitude, query = null) => {
    return searchVideosByLocation(latitude, longitude, query, 'area_videos');
  };

  const clearVideos = () => {
    setVideos([]);
    setError(null);
    setCurrentSearch({
      query: null,
      location: null,
      radius: null,
      type: null
    });
  };

  const closeSearch = () => {
    setCurrentSearch(prev => ({
      ...prev,
      query: null
    }));
    if (!currentSearch.location) {
      setVideos([]);
    }
  };

  const getCurrentSearch = () => {
    return currentSearch;
  };

  return {
    videos,
    loading,
    error,
    currentSearch: getCurrentSearch(),
    searchVideosByLocation,
    searchCurrentLocationVideos,
    searchSelectedLocationVideos,
    searchAreaVideos,
    clearVideos,
    closeSearch
  };
};