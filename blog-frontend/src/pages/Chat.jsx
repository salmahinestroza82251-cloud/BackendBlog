import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/api';
import './Chat.css';

export default function ChatPage() {
  const { user, token } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [receptor, setReceptor] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargandoChat, setCargandoChat] = useState(false);
  const [toast, setToast] = useState(null);
  const mensajesEndRef = useRef(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const obtenerIdUsuarioActual = () => {
    if (user?.id_usuario || user?.id) return user.id_usuario || user.id;
    try {
      const jwt = token || localStorage.getItem('token');
      if (jwt) {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return payload.id || payload.id_usuario || null;
      }
      const guardado = JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('user') || '{}');
      return guardado.id || guardado.id_usuario || null;
    } catch {
      return null;
    }
  };

  const miId = obtenerIdUsuarioActual();

  useEffect(() => {
    cargarContactos();
  }, [miId]);

  const cargarContactos = async () => {
    try {
      const res = await API.get('/apuntes');
      const lista = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      const mapaUsuarios = new Map();
      lista.forEach((apunte) => {
        const idAutor = apunte.id_usuario || apunte.usuario_id || apunte.autor_id;
        const nombreAutor = apunte.autor || apunte.nombre_completo || `Estudiante #${idAutor}`;
        if (idAutor && (!miId || parseInt(idAutor) !== parseInt(miId)) && !mapaUsuarios.has(Number(idAutor))) {
          mapaUsuarios.set(Number(idAutor), { id: Number(idAutor), nombre: nombreAutor });
        }
      });

      setUsuarios(Array.from(mapaUsuarios.values()));
    } catch (err) {
      console.error('Error al cargar contactos:', err);
    }
  };

  useEffect(() => {
    if (!receptor) return;
    obtenerHistorial(receptor.id, true);

    const intervalo = setInterval(() => {
      obtenerHistorial(receptor.id, false);
    }, 3500);

    return () => clearInterval(intervalo);
  }, [receptor]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const obtenerHistorial = async (idReceptor, mostrarCarga = false) => {
    if (mostrarCarga) setCargandoChat(true);
    try {
      const res = await API.get(`/mensajes/${idReceptor}`);
      const lista = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.mensajes || []);
      setMensajes(lista);
    } catch (err) {
      console.error('Error al cargar conversación:', err);
    } finally {
      if (mostrarCarga) setCargandoChat(false);
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !receptor) return;

    try {
      await API.post('/mensajes', {
        id_receptor: Number(receptor.id),
        contenido: nuevoMensaje.trim(),
      });

      setNuevoMensaje('');
      obtenerHistorial(receptor.id, false);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      const detalle = err.response?.data?.mensaje || err.response?.data?.message || 'No se pudo enviar el mensaje';
      mostrarToast(detalle, 'error');
    }
  };

  const handleBloquearUsuario = async () => {
    if (!receptor) return;
    if (!window.confirm(`¿Deseas bloquear a ${receptor.nombre}?`)) return;

    try {
      await API.post('/mensajes/bloquear', {
        id_usuario_bloqueado: Number(receptor.id),
      });
      mostrarToast(`Has bloqueado a ${receptor.nombre}`);
      setReceptor(null);
    } catch (err) {
      console.error('Error al bloquear usuario:', err);
      const detalle = err.response?.data?.mensaje || err.response?.data?.message || 'Error al intentar bloquear al usuario';
      mostrarToast(detalle, 'error');
    }
  };

  return (
    <div className="chat-page-container">
      {toast && (
        <div className={`toast-notification ${toast.tipo}`}>
          <span>{toast.tipo === 'error' ? '⚠️' : '✅'} {toast.mensaje}</span>
        </div>
      )}

      <div className="chat-layout-card">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>💬 Mensajes</h2>
            <p>Comunidad Study Poli</p>
          </div>

          <div className="contacts-list">
            {usuarios.length === 0 ? (
              <div className="empty-contacts">
                <p>No hay otros autores disponibles aún.</p>
              </div>
            ) : (
              usuarios.map((u) => (
                <div
                  key={u.id}
                  className={`contact-item ${receptor?.id === u.id ? 'active' : ''}`}
                  onClick={() => setReceptor(u)}
                >
                  <div className="contact-avatar">{u.nombre.charAt(0).toUpperCase()}</div>
                  <div className="contact-details">
                    <strong>{u.nombre}</strong>
                    <span>Haz clic para conversar</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="chat-main-area">
          {!receptor ? (
            <div className="chat-placeholder">
              <span>📩</span>
              <h3>Selecciona un compañero</h3>
              <p>Elige un estudiante de la lista izquierda para iniciar una conversación privada.</p>
            </div>
          ) : (
            <>
              <header className="chat-active-header">
                <div className="active-user-info">
                  <div className="contact-avatar sm">{receptor.nombre.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3>{receptor.nombre}</h3>
                    <small>Chat privado</small>
                  </div>
                </div>

                <button onClick={handleBloquearUsuario} className="btn-block-user" title="Bloquear usuario">
                  🚫 Bloquear
                </button>
              </header>

              <div className="messages-feed">
                {cargandoChat ? (
                  <p className="chat-status">Cargando mensajes...</p>
                ) : mensajes.length === 0 ? (
                  <p className="chat-status">Aún no hay mensajes. ¡Envía el primer saludo!</p>
                ) : (
                  mensajes.map((m, idx) => {
                    const esMio = miId && parseInt(m.id_emisor) === parseInt(miId);
                    return (
                      <div key={m.id_mensaje || m.id || idx} className={`message-row ${esMio ? 'mine' : 'theirs'}`}>
                        <div className="message-bubble">
                          <p>{m.contenido || m.mensaje}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={mensajesEndRef} />
              </div>

              <form onSubmit={handleEnviarMensaje} className="chat-input-bar">
                <input
                  type="text"
                  placeholder={`Escribe un mensaje para ${receptor.nombre}...`}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                />
                <button type="submit">Enviar ➤</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}