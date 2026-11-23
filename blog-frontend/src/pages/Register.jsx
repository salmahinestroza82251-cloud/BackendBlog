import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/api';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo_institucional: '',
    contraseña: '',
    rol: 'estudiante',
    admin_key: '',
  });
  const [pasoVerificacion, setPasoVerificacion] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
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

    if (formData.rol === 'admin' && formData.admin_key !== 'POLI_ADMIN_2026') {
      const msg = 'La clave secreta de administrador es incorrecta';
      setError(msg);
      toast.error(msg);
      return;
    }

    setCargando(true);
    try {
      await API.post('/auth/registro', formData);
      toast.success('Código enviado. Revisa tu bandeja de entrada. 📩');
      setPasoVerificacion(true);
    } catch (err) {
      const msgError =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Error al registrar el usuario';
      setError(msgError);
      toast.error(msgError);
    } finally {
      setCargando(false);
    }
  };

  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await API.post('/auth/verificar', {
        correo_institucional: formData.correo_institucional,
        codigo,
      });
      toast.success('¡Correo verificado con éxito! Inicia sesión para continuar. 🚀');
      navigate('/login');
    } catch (err) {
      const msgError =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Código inválido o expirado';
      setError(msgError);
      toast.error(msgError);
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid transparent',
    backgroundColor: '#dbeafe',
    color: '#0f172a',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
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
          maxWidth: '900px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}
      >
        {/* Columna Izquierda */}
        <div style={{ padding: '2.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img
              src="/logo.png"
              alt="Study Poli"
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {!pasoVerificacion ? (
            <>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.2rem 0' }}>
                Únete a nuestra comunidad académica
              </p>
              <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1.4rem 0' }}>
                Crear Cuenta
              </h1>

              {error && (
                <div
                  style={{
                    color: '#be123c',
                    backgroundColor: '#ffe4e6',
                    padding: '0.7rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.82rem', color: '#334155' }}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre_completo"
                    placeholder="Ej. Salma Hinestroza"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.82rem', color: '#334155' }}>
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    name="correo_institucional"
                    placeholder="usuario@elpoli.edu.co"
                    value={formData.correo_institucional}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.82rem', color: '#334155' }}>
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
                      style={{ ...inputStyle, paddingRight: '2.8rem' }}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.82rem', color: '#334155' }}>
                    Tipo de Usuario
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {formData.rol === 'admin' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.82rem', color: '#b91c1c' }}>
                      Clave de Autorización Admin
                    </label>
                    <input
                      type="password"
                      name="admin_key"
                      placeholder="Ingresa la clave secreta"
                      value={formData.admin_key}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputStyle,
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fca5a5',
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.6rem' }}>
                  <button
                    type="submit"
                    disabled={cargando}
                    style={{
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '0.85rem 2.6rem',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      cursor: cargando ? 'not-allowed' : 'pointer',
                      opacity: cargando ? 0.7 : 1,
                      boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    {cargando ? 'ENVIANDO CÓDIGO...' : 'REGISTRARME'} <span>→</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '700', margin: '0 0 0.2rem 0' }}>
                Paso final de seguridad
              </p>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.8rem 0' }}>
                Verifica tu Correo
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1.3rem 0', lineHeight: '1.5' }}>
                Enviamos un código de 6 dígitos a <strong>{formData.correo_institucional}</strong>. Ingrésalo abajo para activar tu cuenta:
              </p>

              {error && (
                <div
                  style={{
                    color: '#be123c',
                    backgroundColor: '#ffe4e6',
                    padding: '0.7rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleVerificarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.82rem', color: '#334155' }}>
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{
                      ...inputStyle,
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      fontWeight: '800',
                      letterSpacing: '8px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={cargando || codigo.length < 6}
                    style={{
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '0.85rem 2.4rem',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      cursor: cargando || codigo.length < 6 ? 'not-allowed' : 'pointer',
                      opacity: cargando || codigo.length < 6 ? 0.7 : 1,
                      boxShadow: '0 8px 20px -4px rgba(5, 150, 105, 0.45)',
                    }}
                  >
                    {cargando ? 'VERIFICANDO...' : 'ACTIVAR MI CUENTA ✓'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPasoVerificacion(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  ← Corregir correo o reenviar código
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{ color: '#059669', fontWeight: '700', textDecoration: 'none' }}>
              Inicia sesión aquí
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
            📚
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
            Tus apuntes en un solo lugar
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5', maxWidth: '260px' }}>
            Organiza tus materias, sube resúmenes en PDF y ayuda a otros estudiantes del Poli.
          </p>
        </div>
      </div>
    </div>
  );
}