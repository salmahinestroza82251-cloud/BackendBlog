import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [formData, setFormData] = useState({
    correo_institucional: '',
    contraseña: '',
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', formData);
      login(res.data.usuario, res.data.token);

      toast.info(`¡Bienvenido de nuevo, ${res.data.usuario.nombre_completo || 'estudiante'}! 👋`);
      navigate('/notes');
    } catch (err) {
      const mensajeError = err.response?.data?.mensaje || err.response?.data?.error || 'Correo o contraseña incorrectos';
      setError(mensajeError);
      toast.error(mensajeError);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          padding: '2.5rem 2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
          ¡Hola de nuevo! 👋
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Ingresa a tu cuenta para ver y compartir apuntes
        </p>

        {error && (
          <p
            style={{
              color: '#e11d48',
              backgroundColor: '#ffe4e6',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.2rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            ⚠️ {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Correo Institucional
            </label>
            <input
              type="email"
              name="correo_institucional"
              placeholder="usuario@elpoli.edu.co"
              value={formData.correo_institucional}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '500', fontSize: '0.9rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              name="contraseña"
              placeholder="••••••••"
              value={formData.contraseña}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem' }}>
            Iniciar Sesión
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}