import React, { useState, useEffect } from 'react';
import './ProfileSection.css';

const ProfileSection = ({ user, profileData, setProfileData, isGoogleUser, onBack }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeProfileTab') || 'info';
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('activeProfileTab', activeTab);
  }, [activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: profileData.nombre
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        if (data.user) {
          setProfileData(data.user);
        }
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setMessage({ 
        type: 'error', 
        text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)' 
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setPasswordData({ 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        });
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecciona un archivo de imagen válido (JPEG, PNG, etc.)' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen no debe superar los 2MB' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          foto: base64String
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Foto de perfil actualizada correctamente' });
        setProfileData(prev => ({ 
          ...prev, 
          foto: base64String 
        }));
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al subir la foto' });
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '#dc2626' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    const strengthMap = {
      0: { text: 'Muy débil', color: '#dc2626' },
      1: { text: 'Débil', color: '#dc2626' },
      2: { text: 'Regular', color: '#d97706' },
      3: { text: 'Buena', color: '#ca8a04' },
      4: { text: 'Fuerte', color: '#16a34a' },
      5: { text: 'Muy fuerte', color: '#15803d' }
    };
    
    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;

  // Íconos SVG para mostrar/ocultar contraseña
  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="profile-section">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver al Dashboard
        </button>
        <h2>Mi Perfil</h2>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {profileData?.foto ? (
                <img src={profileData.foto} alt="Avatar" className="avatar-image" />
              ) : (
                <span>{(profileData?.nombre || user?.name)?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <label htmlFor="photo-upload" className={`upload-btn ${loading ? 'disabled' : ''}`}>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                disabled={loading}
              />
              {loading ? 'Subiendo...' : 'Cambiar Foto'}
            </label>
            <small>Formatos: JPEG, PNG (Max. 2MB)</small>
          </div>

          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
              disabled={loading}
            >
              Información Personal
            </button>
            {!isGoogleUser && (
              <button 
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
                disabled={loading}
              >
                Cambiar Contraseña
              </button>
            )}
          </div>
        </div>

        <div className="profile-main">
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'info' && (
            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <h3>Información Personal</h3>
              
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={profileData.nombre || ''}
                  onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                  className="form-input"
                  required
                  minLength="2"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email || user?.email || ''}
                  disabled
                  className="form-input disabled"
                />
                <small>El email no se puede modificar</small>
              </div>

              {isGoogleUser && (
                <div className="google-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Cuenta vinculada con Google
                </div>
              )}

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          )}

          {activeTab === 'password' && !isGoogleUser && (
            <form className="profile-form" onSubmit={handlePasswordChange}>
              <h3>Cambiar Contraseña</h3>
              
              <div className="form-group">
                <label>Contraseña actual</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                    disabled={loading}
                  >
                    {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Nueva contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                    disabled={loading}
                  >
                    {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <small style={{ color: passwordStrength.color }}>
                      Fortaleza: {passwordStrength.text}
                    </small>
                  </div>
                )}
                <small>
                  La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)
                </small>
              </div>

              <div className="form-group">
                <label>Confirmar nueva contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                    disabled={loading}
                  >
                    {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordData.confirmPassword && !passwordsMatch && (
                  <small style={{ color: '#dc2626' }}>Las contraseñas no coinciden</small>
                )}
              </div>

              <button 
                type="submit" 
                className="save-btn" 
                disabled={loading || !passwordsMatch || passwordData.newPassword.length === 0}
              >
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;