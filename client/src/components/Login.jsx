// src/components/Login.jsx
import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, loading, message, setMessage }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { handleRegister, handleLogin, handleGoogleLogin } = onLogin;

  // Validaciones de contraseña
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Al menos un número');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Al menos un carácter especial (@$!%*?&)');
    }
    
    return errors;
  };

  const handlePasswordChange = (password) => {
    const errors = validatePassword(password);
    setPasswordErrors(errors);
    setRegisterData({...registerData, password});
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validar contraseña antes de enviar
    const errors = validatePassword(registerData.password);
    if (errors.length > 0) {
      setMessage('La contraseña no cumple con los requisitos');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    const success = await handleRegister(registerData);
    if (success) {
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
      setPasswordErrors([]);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(loginData);
    if (success) {
      setLoginData({ email: '', password: '' });
    }
  };

  const isPasswordValid = passwordErrors.length === 0 && registerData.password.length > 0;

  return (
    <div className="auth-card">
      {/* Header */}
      <div className="auth-header">
        <div className="logo">
          <h1>GeoTube</h1>
        </div>
        <p>Tu plataforma de videos geolocalizados</p>
      </div>

      {/* Tabs */}
      <div className="auth-tabs">
        <button 
          className={`tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('login');
            setMessage('');
            setPasswordErrors([]);
          }}
        >
          Iniciar Sesión
        </button>
        <button 
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('register');
            setMessage('');
          }}
        >
          Registrarse
        </button>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`message ${message.includes('éxito') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Formulario de Login */}
      {activeTab === 'login' && (
        <div className="auth-form">
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Tu contraseña"
                  required
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="divider">
            <span>o continúa con</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="btn btn-google btn-full"
            disabled={loading}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
            Continuar con Google
          </button>
        </div>
      )}

      {/* Formulario de Registro */}
      {activeTab === 'register' && (
        <div className="auth-form">
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  value={registerData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  required
                  className={registerData.password ? (isPasswordValid ? 'valid' : 'invalid') : ''}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                >
                  {showRegisterPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {registerData.password && (
                <div className="password-strength">
                  <div className={`strength-bar ${isPasswordValid ? 'strong' : 'weak'}`}>
                    <div className="strength-fill"></div>
                  </div>
                  <span className="strength-text">
                    {isPasswordValid ? 'Contraseña segura' : 'Contraseña débil'}
                  </span>
                </div>
              )}

              {/* Lista de requisitos */}
              {registerData.password && (
                <div className="password-requirements">
                  <h4>La contraseña debe tener:</h4>
                  <ul>
                    <li className={registerData.password.length >= 8 ? 'valid' : 'invalid'}>
                      {registerData.password.length >= 8 ? '✓' : '✗'} Mínimo 8 caracteres
                    </li>
                    <li className={/(?=.*[a-z])/.test(registerData.password) ? 'valid' : 'invalid'}>
                      {/(?=.*[a-z])/.test(registerData.password) ? '✓' : '✗'} Una minúscula
                    </li>
                    <li className={/(?=.*[A-Z])/.test(registerData.password) ? 'valid' : 'invalid'}>
                      {/(?=.*[A-Z])/.test(registerData.password) ? '✓' : '✗'} Una mayúscula
                    </li>
                    <li className={/(?=.*\d)/.test(registerData.password) ? 'valid' : 'invalid'}>
                      {/(?=.*\d)/.test(registerData.password) ? '✓' : '✗'} Un número
                    </li>
                    <li className={/(?=.*[@$!%*?&])/.test(registerData.password) ? 'valid' : 'invalid'}>
                      {/(?=.*[@$!%*?&])/.test(registerData.password) ? '✓' : '✗'} Un carácter especial
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirmar contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  placeholder="Repite tu contraseña"
                  required
                  className={registerData.confirmPassword ? 
                    (registerData.confirmPassword === registerData.password ? 'valid' : 'invalid') : ''}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {registerData.confirmPassword && (
                <div className="password-match">
                  {registerData.confirmPassword === registerData.password ? 
                    'Las contraseñas coinciden' : 'Las contraseñas no coinciden'
                  }
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading || !isPasswordValid || registerData.password !== registerData.confirmPassword}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="divider">
            <span>o regístrate con</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="btn btn-google btn-full"
            disabled={loading}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
            <span>Google</span>
          </button>

          <div className="auth-footer">
            <p>Al registrarte aceptas nuestros <a href="#">Términos</a> y <a href="#">Privacidad</a></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;