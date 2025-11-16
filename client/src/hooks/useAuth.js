// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // ← NUEVO ESTADO
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:5000';

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setCheckingAuth(true); // ← Iniciar verificación
      const token = localStorage.getItem('token');
      
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('token');
    } finally {
      setCheckingAuth(false); // ← Finalizar verificación
    }
  };

  // Manejar registro
  const handleRegister = async (registerData) => {
    setLoading(true);
    setMessage('');

    if (registerData.password !== registerData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setMessage('¡Registro exitoso!');
        return true;
      } else {
        setMessage(data.error || 'Error en el registro');
        return false;
      }
    } catch (error) {
      setMessage('Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Manejar login
  const handleLogin = async (loginData) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setMessage('¡Login exitoso!');
        return true;
      } else {
        setMessage(data.error || 'Error en el login');
        return false;
      }
    } catch (error) {
      setMessage('Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login con Google
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setMessage('Sesión cerrada');
    }
  };

  // Verificar token de Google
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      checkAuth();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return {
    user,
    loading,
    checkingAuth, // ← EXPORTAR NUEVO ESTADO
    message,
    setMessage,
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    handleLogout,
    checkAuth
  };
};