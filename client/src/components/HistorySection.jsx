// src/components/HistorySection.jsx
import React, { useState, useEffect } from 'react';
import './HistorySection.css';

const HistorySection = ({ user, onBack }) => {
  const [viewedVideos, setViewedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    fetchViewedVideos();
  }, []);

  const fetchViewedVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/videos/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }

      const data = await response.json();
      setViewedVideos(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching video history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo({
      id: video.youtube_video_id,
      title: video.titulo,
      description: video.descripcion,
      channelTitle: 'YouTube',
      publishedAt: video.creado_en,
      thumbnail: `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`,
      location: {
        name: video.location_name,
        latitude: video.latitude,
        longitude: video.longitude
      }
    });
    setShowVideoPlayer(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('¿Estás seguro de que quieres limpiar todo tu historial de visualizaciones? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/videos/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al limpiar el historial');
      }

      setViewedVideos([]);
    } catch (err) {
      setError(err.message);
      console.error('Error clearing history:', err);
      alert('Error al limpiar el historial: ' + err.message);
    }
  };

  // Estados de carga
  if (loading) {
    return (
      <div className="history-section">
        <div className="section-header">
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver al Dashboard
          </button>
          <div className="history-header-content">
            <h2>Mi Historial de Visualizaciones</h2>
          </div>
        </div>
        <div className="videos-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  // Estados de error
  if (error) {
    return (
      <div className="history-section">
        <div className="section-header">
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver al Dashboard
          </button>
          <div className="history-header-content">
            <h2>Mi Historial de Visualizaciones</h2>
          </div>
        </div>
        <div className="videos-error">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" 
                  stroke="#EF4444" strokeWidth="2" fill="#EF4444"/>
          </svg>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchViewedVideos}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" 
                    stroke="currentColor" strokeWidth="2"/>
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-section">
      <div className="section-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver al Dashboard
        </button>
        <div className="history-header-content">
          <h2>Mi Historial de Visualizaciones</h2>
          <div className="history-controls">
            <div className="video-count-badge">
              <span className="count-number">{viewedVideos.length}</span>
              <span className="count-text">
                video{viewedVideos.length !== 1 ? 's' : ''}<br/>visto{viewedVideos.length !== 1 ? 's' : ''}
              </span>
            </div>
            {viewedVideos.length > 0 && (
              <button className="clear-history-btn" onClick={clearHistory}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" 
                        stroke="currentColor" strokeWidth="2"/>
                </svg>
                Limpiar Historial
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="history-content">
        {viewedVideos.length === 0 ? (
          <div className="videos-empty">
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>No hay videos en tu historial</h3>
            <p>Los videos que veas en el mapa aparecerán aquí para que puedas acceder a ellos fácilmente</p>
            <button className="explore-button" onClick={onBack}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Explorar Videos en el Mapa
            </button>
          </div>
        ) : (
          <div className="video-list">
            {viewedVideos.map((video, index) => (
              <div 
                key={`${video.youtube_video_id}-${index}-${video.creado_en}`} 
                className="video-item"
                onClick={() => handleVideoClick(video)}
              >
                <img 
                  src={`https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`}
                  alt={video.titulo}
                  className="video-thumbnail"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120x90/3B82F6/FFFFFF?text=Video';
                  }}
                />
                
                <div className="video-info">
                  <h3 className="video-title">{video.titulo}</h3>
                  
                  {video.descripcion && (
                    <p className="video-channel">
                      {video.descripcion.length > 120 
                        ? `${video.descripcion.substring(0, 120)}...` 
                        : video.descripcion
                      }
                    </p>
                  )}
                  
                  <div className="video-meta">
                    {video.location_name && (
                      <span className="video-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                                stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        {video.location_name}
                      </span>
                    )}
                    
                    <span className="video-date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {formatDate(video.creado_en)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <div className="video-player-modal-overlay" onClick={() => setShowVideoPlayer(false)}>
          <div className="video-player-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedVideo.title}</h3>
              <button className="close-modal" onClick={() => setShowVideoPlayer(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySection;