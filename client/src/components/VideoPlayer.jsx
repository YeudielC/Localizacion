// src/components/VideoPlayer.jsx
import React, { useState, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ video, isOpen, onClose, user }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showVideoDetails, setShowVideoDetails] = useState(false);

  useEffect(() => {
    if (isOpen && video) {
      setIsVisible(true);
      setShowFullDescription(false);
      setShowVideoDetails(false);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, video]);

  if (!isVisible && !isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleYouTubeRedirect = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const toggleVideoDetails = () => {
    setShowVideoDetails(!showVideoDetails);
  };

  const formatDescription = (description) => {
    if (!description) return 'No hay descripción disponible.';
    
    if (description.length <= 200 || showFullDescription) {
      return description;
    }
    
    return `${description.substring(0, 200)}...`;
  };

  const getDescriptionButtonText = () => {
    if (!video?.description) return '';
    
    if (video.description.length <= 200) return '';
    
    return showFullDescription ? 'Ver menos' : 'Ver más';
  };

  return (
    <div 
      className={`video-player-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="video-player-modal">
        <div className="video-player-header">
          <h3 className="video-player-title">{video?.title}</h3>
          <button className="video-player-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className="video-player-content">
          <div className="video-embed-container">
            <iframe
              src={`https://www.youtube.com/embed/${video?.id}?autoplay=1&rel=0`}
              title={video?.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-iframe"
            />
          </div>

          <div className="video-info-panel">
            <div className="video-channel-info">
              <div className="channel-info-left">
                <h4 className="channel-title">{video?.channelTitle}</h4>
                <div className="video-meta-info">
                  <span className="publish-date">
                    Publicado: {video?.publishedAt ? new Date(video.publishedAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                  </span>
                </div>
              </div>
              
              {video?.location?.name && (
                <div className="video-location-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {video.location.name}
                </div>
              )}
            </div>

            <div className="video-description-section">
              <h5 className="description-title">Descripción</h5>
              <div className="video-description">
                <p>{formatDescription(video?.description)}</p>
                {video?.description && video.description.length > 200 && (
                  <button 
                    className="show-more-btn"
                    onClick={toggleDescription}
                  >
                    {getDescriptionButtonText()}
                  </button>
                )}
              </div>
            </div>

            <div className="video-details-section">
              <button 
                className="details-toggle-btn"
                onClick={toggleVideoDetails}
              >
                <span>Información del Video</span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className={`details-arrow ${showVideoDetails ? 'expanded' : ''}`}
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>

              {showVideoDetails && (
                <div className="video-details-content">
                  <div className="detail-row">
                    <span className="detail-label">ID del Video:</span>
                    <span className="detail-value">{video?.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Canal:</span>
                    <span className="detail-value">{video?.channelTitle}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Publicado:</span>
                    <span className="detail-value">
                      {video?.publishedAt ? new Date(video.publishedAt).toLocaleString('es-ES') : 'No disponible'}
                    </span>
                  </div>
                  {video?.location && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Ubicación:</span>
                        <span className="detail-value">{video.location.name || 'No especificada'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Coordenadas:</span>
                        <span className="detail-value">
                          Lat: {video.location.latitude?.toFixed(6)}, Lng: {video.location.longitude?.toFixed(6)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Término de búsqueda:</span>
                        <span className="detail-value">{video.location.searchQuery || 'Búsqueda general'}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="video-player-actions">
          <button className="youtube-redirect-btn" onClick={handleYouTubeRedirect}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-2.3 6.35l-4.5 2.6c-.3.2-.7.2-1 0s-.5-.5-.5-.9V9.8c0-.4.2-.7.5-.9.3-.2.7-.2 1 0l4.5 2.6c.3.2.5.5.5.9s-.2.7-.5.9z"/>
            </svg>
            Ver en YouTube
          </button>
          
          <button className="close-player-btn" onClick={onClose}>
            Cerrar Reproductor
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;