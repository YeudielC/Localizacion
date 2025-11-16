// src/App.jsx
import React from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

const App = () => {
  const {
    user,
    loading,
    checkingAuth, // ← RECIBIR NUEVO ESTADO
    message,
    setMessage,
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    handleLogout
  } = useAuth();

  const authActions = {
    handleRegister,
    handleLogin,
    handleGoogleLogin
  };

  // Mostrar loading mientras se verifica la autenticación
  if (checkingAuth) {
    return (
      <div className="auth-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado, mostrar Dashboard (ocupa toda la pantalla)
  if (user) {
    return (
      <div className="dashboard-page">
        <Dashboard 
          user={user} 
          message={message} 
          onLogout={handleLogout} 
        />
      </div>
    );
  }

  // Si no está autenticado, mostrar Login (centrado)
  return (
    <div className="auth-page">
      <div className="container">
        <Login 
          onLogin={authActions}
          loading={loading}
          message={message}
          setMessage={setMessage}
        />
      </div>
    </div>
  );
};

export default App;