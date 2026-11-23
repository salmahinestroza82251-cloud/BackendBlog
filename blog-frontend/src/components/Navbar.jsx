import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import API from '../api/api';

export default function Navbar({ busqueda = '', setBusqueda = () => {}, mensajesNoLeidos = 0 }) {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado menú móvil
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Modal PQR / Solicitar materia
  const [modalPqrAbierto, setModalPqrAbierto] = useState(false);
  const [tipoPqr, setTipoPqr] = useState('solicitud_materia');
  const [mensajePqr, setMensajePqr] = useState('');
  const [enviandoPqr, setEnviandoPqr] = useState(false);

  const iniciarTourGuiado = () => {
    setMenuMovilAbierto(false);
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      progressText: 'Paso {{current}} de {{total}}',
      steps: [
        {
          element: '#tour-buscador',
          popover: {
            title: '🔍 Buscador Inteligente',
            description: 'Escribe aquí el nombre de una materia, tema o palabra clave para filtrar los apuntes al instante.',
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#tour-inicio',
          popover: {
            title: '🏠 Feed de Apuntes',
            description: 'Explora todos los documentos compartidos por la comunidad, ábrelos en pantalla completa, califícalos y deja comentarios.',
            side: 'bottom',
          },
        },
        {
          element: '#tour-mis-apuntes',
          popover: {
            title: '📚 Mis Apuntes y Publicaciones',
            description: 'Desde aquí puedes subir tus propios resúmenes en PDF y administrar tus archivos compartidos.',
            side: 'bottom',
          },
        },
        {
          element: '#tour-pqr',
          popover: {
            title: '📩 Buzón PQR y Solicitud de Materias',
            description: '¿No encuentras tu asignatura en la lista o tienes una queja? Solicita aquí la creación de nuevas materias al Administrador.',
            side: 'bottom',
          },
        },
        {
          element: '#tour-chat',
          popover: {
            title: '💬 Chat Académico Privado',
            description: 'Comunícate directamente con otros estudiantes del Poli para resolver dudas o coordinar grupos de estudio.',
            side: 'bottom',
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem('studypoli_tour_visto', 'true');
      },
    });

    driverObj.drive();
  };

  useEffect(() => {
    if (token) {
      const yaVioTour = localStorage.getItem('studypoli_tour_visto');
      if (!yaVioTour) {
        const timer = setTimeout(() => {
          iniciarTourGuiado();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setMenuMovilAbierto(false);
    logout();
    navigate('/login');
  };

  const obtenerNombreUsuario = () => {
    if (user?.nombre_completo || user?.nombre || user?.name || user?.nombre_usuario) {
      return user.nombre_completo || user.nombre || user.name || user.nombre_usuario;
    }
    try {
      const guardado = JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('user') || '{}');
      return (
        guardado.nombre_completo ||
        guardado.nombre ||
        guardado.name ||
        guardado.nombre_usuario ||
        guardado.correo_institucional?.split('@')[0] ||
        'Estudiante'
      );
    } catch {
      return 'Estudiante';
    }
  };

  const nombreUsuario = obtenerNombreUsuario();

  const handleEnviarPqr = async (e) => {
    e.preventDefault();
    if (!mensajePqr.trim()) return;

    setEnviandoPqr(true);
    try {
      await API.post('/reportes', {
        tipo_reporte: tipoPqr,
        motivo: mensajePqr.trim(),
        id_objeto_reportado: 0,
      });
      toast.success('¡Tu solicitud/PQR fue enviada al Administrador! 📩');
      setMensajePqr('');
      setModalPqrAbierto(false);
    } catch (err) {
      console.error('Error al enviar PQR:', err);
      toast.error(err.response?.data?.message || 'No se pudo enviar la solicitud');
    } finally {
      setEnviandoPqr(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-top-row">
          <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="Study Poli"
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Barra de Búsqueda Central */}
          <div id="tour-buscador" className="navbar-search-box">
            <span style={{ fontSize: '0.85rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por título o materia..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                marginLeft: '0.5rem',
                fontSize: '0.85rem',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Botón Hamburguesa (Solo visible en celulares) */}
          <button
            type="button"
            className="navbar-hamburger-btn"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label="Abrir menú"
          >
            {menuMovilAbierto ? '✕' : '☰'}
          </button>
        </div>

        <nav className={`navbar-links ${menuMovilAbierto ? 'mobile-open' : ''}`}>
          <Link to="/" id="tour-inicio" className="nav-link" onClick={() => setMenuMovilAbierto(false)}>
            Inicio
          </Link>

          {token ? (
            <>
              <Link to="/notes" id="tour-mis-apuntes" className="nav-link" onClick={() => setMenuMovilAbierto(false)}>
                Mis Apuntes
              </Link>

              {/* Botón PQR / Solicitar Materia */}
              <button
                type="button"
                id="tour-pqr"
                onClick={() => {
                  setMenuMovilAbierto(false);
                  setModalPqrAbierto(true);
                }}
                style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  borderRadius: '16px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                title="Enviar petición de materia, queja o reclamo al Administrador"
              >
                📩 PQR / Materias
              </button>

              {/* Icono de Chat Privado */}
              <Link
                to="/chat"
                id="tour-chat"
                onClick={() => setMenuMovilAbierto(false)}
                style={{ position: 'relative', fontSize: '1.25rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                title="Chat Privado"
              >
                <span>💬</span>
                <span className="mobile-only-label">Chat</span>
                {mensajesNoLeidos > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-8px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      padding: '0.12rem 0.38rem',
                    }}
                  >
                    {mensajesNoLeidos}
                  </span>
                )}
              </Link>

              {/* Botón para repetir el Tour Guiado */}
              <button
                type="button"
                onClick={iniciarTourGuiado}
                style={{
                  background: '#e0f2fe',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
                title="Ver guía interactiva de la plataforma"
              >
                ?
              </button>

              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Hola, <strong>{nombreUsuario}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-outline">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" onClick={() => setMenuMovilAbierto(false)}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuMovilAbierto(false)}>
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Modal de PQR / Solicitud de Materias */}
      {modalPqrAbierto && (
        <div
          onClick={() => setModalPqrAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '1.8rem',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>📩 Buzón PQR y Solicitudes</h3>
              <button
                type="button"
                onClick={() => setModalPqrAbierto(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.2rem' }}>
              Comunícate directamente con el Administrador para solicitar la creación de una nueva materia o reportar una queja/reclamo.
            </p>

            <form onSubmit={handleEnviarPqr} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Tipo de solicitud
                </label>
                <select
                  value={tipoPqr}
                  onChange={(e) => setTipoPqr(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="solicitud_materia">📚 Solicitar creación de nueva materia</option>
                  <option value="peticion">🙋 Petición general</option>
                  <option value="queja_reclamo">⚠️ Queja o Reclamo</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Detalle de tu mensaje
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    tipoPqr === 'solicitud_materia'
                      ? 'Ej: Por favor agregar la materia "Física Mecánica" al listado oficial...'
                      : 'Describe tu petición, queja o reclamo para el administrador...'
                  }
                  value={mensajePqr}
                  onChange={(e) => setMensajePqr(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setModalPqrAbierto(false)}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={enviandoPqr} className="btn btn-primary">
                  {enviandoPqr ? 'Enviando...' : 'Enviar al Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}