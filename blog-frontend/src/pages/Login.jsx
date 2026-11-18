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
  const [mostrarPass, setMostrarPass] = useState(false);
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
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      login(res.data.usuario, res.data.token);

      toast.info(`¡Bienvenido de nuevo, ${res.data.usuario.nombre_completo || 'estudiante'}! 👋`);
      navigate('/notes');
    } catch (err) {
      const mensajeError =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'Correo o contraseña incorrectos';
      setError(mensajeError);
      toast.error(mensajeError);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 50%, #d1fae5 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}
      >
        {/* Columna Izquierda: Formulario */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <img
              src="/logo.png"
              alt="Study Poli"
              style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>
            ¡Bienvenido de nuevo! 👋
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1.6rem 0' }}>
            Iniciar Sesión
          </h1>

          {error && (
            <div
              style={{
                color: '#be123c',
                backgroundColor: '#ffe4e6',
                padding: '0.7rem 1rem',
                borderRadius: '10px',
                marginBottom: '1.2rem',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: '#334155' }}>
                Correo Institucional
              </label>
              <input
                type="email"
                name="correo_institucional"
                placeholder="usuario@elpoli.edu.co"
                value={formData.correo_institucional}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid transparent',
                  backgroundColor: '#dbeafe',
                  color: '#0f172a',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.82rem', color: '#334155' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  name="contraseña"
                  placeholder="••••••••••••"
                  value={formData.contraseña}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem 2.8rem 0.8rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid transparent',
                    backgroundColor: '#dbeafe',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#475569',
                  }}
                  title="Mostrar / ocultar contraseña"
                >
                  {mostrarPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8rem' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.85rem 2.6rem',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                INGRESAR <span>→</span>
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.85rem', color: '#64748b' }}>
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" style={{ color: '#059669', fontWeight: '700', textDecoration: 'none' }}>
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Columna Derecha: Panel Pastel Decorativo */}
        <div
          style={{
            backgroundColor: '#bae6fd',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '185px',
              height: '185px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              marginBottom: '1.5rem',
              fontSize: '5.5rem',
            }}
          >
            👩‍💻
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
            Comunidad Estudiosa
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5', maxWidth: '260px' }}>
            Explora apuntes verificados, comparte tus resúmenes en PDF y prepárate mejor para cada parcial.
          </p>
        </div>
      </div>
    </div>
  );
}