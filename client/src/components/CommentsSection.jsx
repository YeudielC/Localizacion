import React, { useState, useEffect } from 'react';
import './CommentsSection.css';

const CommentsSection = ({ user, onBack }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    comentario: '',
    calificacion: 5
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingComment, setEditingComment] = useState(null);

  // Cargar comentarios al montar el componente
  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        throw new Error('Error al cargar comentarios');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al cargar los comentarios' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.comentario.trim()) {
      setMessage({ type: 'error', text: 'Por favor, escribe un comentario' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = editingComment 
        ? `http://localhost:5000/api/comments/${editingComment.id}`
        : 'http://localhost:5000/api/comments';
      
      const method = editingComment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comentario: newComment.comentario,
          calificacion: newComment.calificacion
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingComment ? 'Comentario actualizado' : 'Comentario enviado' 
        });
        
        setNewComment({ comentario: '', calificacion: 5 });
        setEditingComment(null);
        loadComments(); // Recargar comentarios
      } else {
        throw new Error(data.error || 'Error al enviar comentario');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setNewComment({
      comentario: comment.comentario,
      calificacion: comment.calificacion
    });
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Comentario eliminado' });
        loadComments(); // Recargar comentarios
      } else {
        throw new Error('Error al eliminar comentario');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al eliminar el comentario' });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setNewComment({ comentario: '', calificacion: 5 });
  };

  // Calcular promedio de calificaciones
  const averageRating = comments.length > 0 
    ? (comments.reduce((sum, comment) => sum + comment.calificacion, 0) / comments.length).toFixed(1)
    : 0;

  return (
    <div className="comments-section">
      <div className="comments-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver al Dashboard
        </button>
        <h2>Comentarios y Calificaciones</h2>
      </div>

      <div className="comments-content">
        {/* Resumen de calificaciones */}
        <div className="ratings-summary">
          <div className="summary-card">
            <h3>Calificación Promedio</h3>
            <div className="average-rating">
              <span className="rating-number">{averageRating}</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg 
                    key={star} 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill={star <= averageRating ? "#F59E0B" : "#E5E7EB"}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="total-comments">({comments.length} comentarios)</span>
            </div>
          </div>
        </div>

        {/* Formulario de comentario */}
        <div className="comment-form-section">
          <div className="form-card">
            <h3>{editingComment ? 'Editar Comentario' : 'Deja tu Comentario'}</h3>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmitComment}>
              <div className="form-group">
                <label>Calificación</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= newComment.calificacion ? 'active' : ''}`}
                      onClick={() => setNewComment({...newComment, calificacion: star})}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                              fill={star <= newComment.calificacion ? "#F59E0B" : "#E5E7EB"}/>
                      </svg>
                    </button>
                  ))}
                  <span className="rating-text">
                    {newComment.calificacion === 5 ? 'Excelente' :
                     newComment.calificacion === 4 ? 'Muy Bueno' :
                     newComment.calificacion === 3 ? 'Bueno' :
                     newComment.calificacion === 2 ? 'Regular' : 'Malo'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Tu Comentario</label>
                <textarea
                  value={newComment.comentario}
                  onChange={(e) => setNewComment({...newComment, comentario: e.target.value})}
                  placeholder="Comparte tu experiencia con GeoTube..."
                  rows="4"
                  className="comment-textarea"
                  required
                />
              </div>

              <div className="form-actions">
                {editingComment && (
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading || !newComment.comentario.trim()}
                >
                  {loading ? 'Enviando...' : editingComment ? 'Actualizar' : 'Enviar Comentario'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de comentarios */}
        <div className="comments-list-section">
          <div className="comments-card">
            <h3>Comentarios de la Comunidad</h3>
            
            {loading && comments.length === 0 ? (
              <div className="loading-comments">
                <div className="loading-spinner"></div>
                <p>Cargando comentarios...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="no-comments">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="#9CA3AF">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>No hay comentarios aún</p>
                <p>Sé el primero en compartir tu experiencia</p>
              </div>
            ) : (
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          {comment.usuario_foto ? (
                            <img src={comment.usuario_foto} alt="Avatar" />
                          ) : (
                            <span>{comment.usuario_nombre?.charAt(0)?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{comment.usuario_nombre}</span>
                          <span className="comment-date">
                            {new Date(comment.creado_en).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="comment-rating">
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg 
                              key={star} 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill={star <= comment.calificacion ? "#F59E0B" : "#E5E7EB"}
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="comment-content">
                      <p>{comment.comentario}</p>
                    </div>

                    {/* Botones de acción (solo para comentarios del usuario actual) */}
                    {comment.usuario_id === user?.id && (
                      <div className="comment-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditComment(comment)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Editar
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" 
                                  stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;