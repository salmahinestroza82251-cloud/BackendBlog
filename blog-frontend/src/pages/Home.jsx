import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/api';
import './Home.css';

export default function HomePage({ busqueda = '' }) {
  const { user, token } = useContext(AuthContext);
  const [apuntes, setApuntes] = useState([]);
  const [recomendados, setRecomendados] = useState([]);
  const [cargandoApuntes, setCargandoApuntes] = useState(true);
  const [apunteSeleccionado, setApunteSeleccionado] = useState(null);

  // Comentarios y calificaciones
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [calificacionUsuario, setCalificacionUsuario] = useState(0);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);

  // Estado para editar comentarios
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  // Estado para reportar apunte
  const [mostrandoReporte, setMostrandoReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState('');

  // Notificaciones Emergentes (Toasts)
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    cargarApuntesInicio();
    cargarRecomendaciones();
  }, []);

  const cargarApuntesInicio = async () => {
    setCargandoApuntes(true);
    try {
      const res = await API.get('/apuntes');
      const lista = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setApuntes(lista);
    } catch (err) {
      console.error('Error al cargar apuntes:', err);
      mostrarToast('Error al conectar con el servidor', 'error');
    } finally {
      setCargandoApuntes(false);
    }
  };

  const cargarRecomendaciones = async () => {
    try {
      const res = await API.get('/recomendaciones/feed');
      const lista = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.data?.recomendaciones || []);
      setRecomendados(lista.slice(0, 3));
    } catch {
      setRecomendados([]);
    }
  };

  const obtenerIdUsuarioActual = () => {
    if (user?.id_usuario || user?.id) return user.id_usuario || user.id;
    try {
      const u1 = JSON.parse(localStorage.getItem('usuario') || 'null');
      const u2 = JSON.parse(localStorage.getItem('user') || 'null');
      const obj = u1 || u2;
      if (obj && (obj.id_usuario || obj.id)) return obj.id_usuario || obj.id;

      const jwt = token || localStorage.getItem('token');
      if (jwt) {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return payload.id || payload.id_usuario || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const idUsuarioLogueado = obtenerIdUsuarioActual();
  const estaAutenticado = Boolean(idUsuarioLogueado || token || localStorage.getItem('token'));

  const handleAbrirApunte = async (item) => {
    setApunteSeleccionado(item);
    setCalificacionUsuario(0);
    setCargandoComentarios(true);
    setEditandoId(null);
    setMostrandoReporte(false);
    setMotivoReporte('');

    const idApunte = item.id_apunte || item.id;
    try {
      const res = await API.get(`/interacciones/${idApunte}/comentarios`);
      const listaComentarios = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setComentarios(listaComentarios);
    } catch (err) {
      console.error('Error al obtener comentarios:', err);
      setComentarios([]);
    } finally {
      setCargandoComentarios(false);
    }
  };

  const handleCerrarModal = () => {
    setApunteSeleccionado(null);
    setNuevoComentario('');
    setComentarios([]);
    setCalificacionUsuario(0);
    setEditandoId(null);
    setMostrandoReporte(false);
    setMotivoReporte('');
  };

  // Enviar Reporte de Apunte adaptado exactamente a reporteController.js
  const handleEnviarReporte = async (e) => {
    e.preventDefault();
    if (!motivoReporte.trim()) return;

    if (!estaAutenticado) {
      mostrarToast('Inicia sesión para reportar un apunte', 'error');
      return;
    }

    const idApunte = apunteSeleccionado.id_apunte || apunteSeleccionado.id;

    try {
      await API.post('/reportes', {
        tipo_reporte: 'apunte',
        motivo: motivoReporte.trim(),
        id_objeto_reportado: Number(idApunte),
      });

      mostrarToast('Reporte enviado al equipo de administración');
      setMostrandoReporte(false);
      setMotivoReporte('');
    } catch (err) {
      console.error('Error al enviar reporte:', err);
      mostrarToast(err.response?.data?.message || err.response?.data?.mensaje || 'No se pudo enviar el reporte', 'error');
    }
  };

  // Crear Comentario
  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    if (!estaAutenticado) {
      mostrarToast('Inicia sesión para publicar un comentario', 'error');
      return;
    }

    const idApunte = apunteSeleccionado.id_apunte || apunteSeleccionado.id;

    try {
      await API.post(`/interacciones/${idApunte}/comentarios`, {
        contenido: nuevoComentario,
        ...(idUsuarioLogueado ? { id_usuario: idUsuarioLogueado } : {}),
      });

      setNuevoComentario('');
      mostrarToast('Comentario publicado exitosamente');

      const res = await API.get(`/interacciones/${idApunte}/comentarios`);
      setComentarios(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      console.error('Error al enviar comentario:', err);
      mostrarToast('Error al publicar el comentario', 'error');
    }
  };

  // Guardar Edición de Comentario
  const handleGuardarEdicion = async (idComentario) => {
    if (!textoEditado.trim()) return;

    try {
      await API.put(`/interacciones/comentarios/${idComentario}`, {
        contenido: textoEditado,
        ...(idUsuarioLogueado ? { id_usuario: idUsuarioLogueado } : {}),
      });

      setEditandoId(null);
      setTextoEditado('');
      mostrarToast('Comentario editado correctamente');

      const idApunte = apunteSeleccionado.id_apunte || apunteSeleccionado.id;
      const res = await API.get(`/interacciones/${idApunte}/comentarios`);
      setComentarios(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      console.error('Error al editar comentario:', err);
      mostrarToast('Error al editar el comentario', 'error');
    }
  };

  // Borrar Comentario
  const handleEliminarComentario = async (idComentario) => {
    if (!window.confirm('¿Deseas eliminar este comentario?')) return;

    try {
      await API.delete(`/interacciones/comentarios/${idComentario}`);
      mostrarToast('Comentario eliminado');

      const idApunte = apunteSeleccionado.id_apunte || apunteSeleccionado.id;
      const res = await API.get(`/interacciones/${idApunte}/comentarios`);
      setComentarios(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      mostrarToast('Error al eliminar comentario', 'error');
    }
  };

  // Calificar
  const handleCalificar = async (puntos) => {
    if (!estaAutenticado) {
      mostrarToast('Inicia sesión para calificar', 'error');
      return;
    }

    setCalificacionUsuario(puntos);
    const idApunte = apunteSeleccionado.id_apunte || apunteSeleccionado.id;

    try {
      await API.post(`/interacciones/${idApunte}/calificar`, {
        valor: puntos,
        ...(idUsuarioLogueado ? { id_usuario: idUsuarioLogueado } : {}),
      });
      mostrarToast(`¡Calificado con ${puntos} estrellas!`);
    } catch (err) {
      console.error('Error al registrar calificación:', err);
    }
  };

  const getPdfUrl = (item) => {
    if (!item) return null;
    let pdfUrl = item.ruta_archivo || item.url_pdf || item.archivo;
    if (!pdfUrl || pdfUrl === 'sin_archivo.pdf') return null;
    if (pdfUrl.startsWith('http')) return pdfUrl;

    pdfUrl = pdfUrl.replace(/\\/g, '/');
    if (!pdfUrl.startsWith('/')) pdfUrl = `/${pdfUrl}`;

    const host = window.location.hostname || 'localhost';
    return `http://${host}:4000${pdfUrl}`;
  };

  const fullPdfUrl = getPdfUrl(apunteSeleccionado);

  // Función auxiliar para eliminar tildes y comparar sin importar mayúsculas/acentos
  const normalizar = (str) =>
    String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const apuntesFiltrados = apuntes.filter((item) => {
    const texto = normalizar(busqueda);
    if (!texto) return true;
    const titulo = normalizar(item.titulo);
    const materia = normalizar(item.materia || item.nombre_materia);
    const descripcion = normalizar(item.descripcion || item.contenido);
    const autor = normalizar(item.autor);
    return (
      titulo.includes(texto) ||
      materia.includes(texto) ||
      descripcion.includes(texto) ||
      autor.includes(texto)
    );
  });

  return (
    <div className="home-page-wrapper">
      {toast && (
        <div className={`toast-notification ${toast.tipo}`}>
          <span className="toast-icon">{toast.tipo === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.mensaje}</span>
        </div>
      )}

      {/* Banner Hero Estilo Evernote */}
      <section className="hero-banner-evernote">
        <div className="hero-banner-content">
          <div className="hero-text-block">
            <span className="hero-tag-badge">📚 Comunidad Universitaria</span>
            <h1 className="hero-main-title">
              Tus apuntes. <br />
              Organizados. <br />
              <span>Sin esfuerzo.</span>
            </h1>
            <p className="hero-subtext">
              Explora, comparte y califica el mejor material de estudio académico del Poli en un solo lugar.
            </p>
          </div>

          <div className="hero-decorative-card">
            <div className="decorative-card-header">
              <div className="card-window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="badge-highlight">⭐ Destacado</span>
            </div>
            <div className="decorative-card-body">
              <h3>Estructuras de Datos & Algoritmos</h3>
              <p>Resúmenes completos con diagramas, ejercicios resueltos y guías de examen.</p>
              <div className="decorative-card-footer">
                <span>Por Estudiantes Poli</span>
                <span className="rating-pill">★ 4.9</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección del Listado Principal */}
      <main className="main-feed-container">
        {!busqueda && recomendados.length > 0 && (
          <section className="recommended-section">
            <div className="feed-header-flex">
              <div>
                <h2 className="feed-title">✨ Recomendados para ti</h2>
                <p className="feed-subtitle">Material destacado seleccionado según tus intereses académicos.</p>
              </div>
            </div>

            <div className="apuntes-grid">
              {recomendados.map((item) => {
                const id = item.id_apunte || item.id;
                const materia = item.materia || item.nombre_materia || 'General';
                return (
                  <article
                    key={`rec-${id}`}
                    className="apunte-card-item recommended-card"
                    onClick={() => handleAbrirApunte(item)}
                  >
                    <div className="card-top-content">
                      <div className="card-badges-row">
                        <span className="materia-chip">{materia}</span>
                        <span className="rec-badge">⭐ Recomendado</span>
                      </div>
                      <h3 className="card-apunte-title">{item.titulo}</h3>
                      <p className="card-apunte-excerpt">
                        {item.descripcion || item.contenido || 'Haz clic para ver el contenido completo.'}
                      </p>
                    </div>
                    <div className="card-bottom-bar">
                      <span className="author-info">👤 {item.autor || 'Estudiante Poli'}</span>
                      <span className="action-link">Ver detalles →</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <div className="feed-header-flex">
          <div>
            <h2 className="feed-title">
              {busqueda ? `Resultados para "${busqueda}"` : 'Artículos y Apuntes Recientes'}
            </h2>
            <p className="feed-subtitle">Haz clic sobre cualquier apunte para previsualizarlo, calificarlo o comentar.</p>
          </div>
        </div>

        {cargandoApuntes ? (
          <div className="apuntes-grid">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className="skeleton-card">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line tag"></div>
                <div className="skeleton-line body"></div>
              </div>
            ))}
          </div>
        ) : apuntesFiltrados.length === 0 ? (
          <div className="empty-state-box">
            <span className="empty-icon">📂</span>
            <h3>No hay publicaciones disponibles</h3>
            <p>
              {busqueda
                ? `No se encontraron resultados que coincidan con "${busqueda}".`
                : 'Aún no se han compartido apuntes en la plataforma. ¡Sé el primero en subir uno!'}
            </p>
          </div>
        ) : (
          <div className="apuntes-grid">
            {apuntesFiltrados.map((item) => {
              const id = item.id_apunte || item.id;
              const materia = item.materia || item.nombre_materia || 'General';

              return (
                <article
                  key={id}
                  className="apunte-card-item"
                  onClick={() => handleAbrirApunte(item)}
                >
                  <div className="card-top-content">
                    <span className="materia-chip">{materia}</span>
                    <h3 className="card-apunte-title">{item.titulo}</h3>
                    <p className="card-apunte-excerpt">
                      {item.descripcion || item.contenido || 'Haz clic para ver el contenido completo y documento adjunto.'}
                    </p>
                  </div>

                  <div className="card-bottom-bar">
                    <span className="author-info">
                      <i className="user-icon">👤</i> {item.autor || 'Anónimo'}
                    </span>
                    <span className="action-link">Ver detalles →</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Dual Pane */}
      {apunteSeleccionado && (
        <div className="modal-backdrop-overlay" onClick={handleCerrarModal}>
          <div className="modal-dual-pane-container" onClick={(e) => e.stopPropagation()}>
            <button className="btn-modal-close" onClick={handleCerrarModal} title="Cerrar modal">
              ✕
            </button>

            <div className="modal-left-column">
              <div className="modal-header-info">
                <div className="modal-top-tags">
                  <span className="materia-chip">
                    {apunteSeleccionado.materia || apunteSeleccionado.nombre_materia || 'General'}
                  </span>
                  <button
                    type="button"
                    className="btn-report-trigger"
                    onClick={() => setMostrandoReporte(!mostrandoReporte)}
                    title="Reportar contenido inapropiado o erróneo"
                  >
                    🚩 Reportar
                  </button>
                </div>
                <h2>{apunteSeleccionado.titulo}</h2>
              </div>

              {mostrandoReporte && (
                <form onSubmit={handleEnviarReporte} className="report-box-form">
                  <label>¿Por qué deseas reportar este apunte?</label>
                  <div className="report-input-row">
                    <input
                      type="text"
                      placeholder="Ej: Archivo corrupto, spam, materia equivocada..."
                      value={motivoReporte}
                      onChange={(e) => setMotivoReporte(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-report-submit">Enviar</button>
                  </div>
                </form>
              )}

              <div className="pdf-viewer-wrapper">
                {fullPdfUrl ? (
                  <object data={fullPdfUrl} type="application/pdf" className="pdf-iframe-frame">
                    <iframe src={fullPdfUrl} title="Vista Previa Apunte" className="pdf-iframe-frame" />
                  </object>
                ) : (
                  <div className="pdf-placeholder-empty">
                    <span>📄</span>
                    <p>{apunteSeleccionado.contenido || apunteSeleccionado.descripcion || 'Este apunte no incluye un documento PDF adjunto.'}</p>
                  </div>
                )}
              </div>

              {fullPdfUrl && (
                <div className="pdf-actions-row">
                  <a href={fullPdfUrl} target="_blank" rel="noreferrer" className="btn-pdf-primary">
                    🔍 Abrir en pantalla completa
                  </a>
                  <a href={fullPdfUrl} download className="btn-pdf-secondary">
                    ⬇️ Descargar PDF
                  </a>
                </div>
              )}
            </div>

            <div className="modal-right-column">
              <h3 className="section-subheading">Calificación y Opiniones</h3>

              <div className="rating-box-card">
                <p>¿Qué te pareció este apunte?</p>
                <div className="stars-selector-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star-icon ${star <= calificacionUsuario ? 'active' : ''}`}
                      onClick={() => handleCalificar(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="comments-scroll-list">
                {cargandoComentarios ? (
                  <p className="comments-status-text">Cargando comentarios...</p>
                ) : comentarios.length === 0 ? (
                  <div className="comments-empty">
                    <p>💬 Aún no hay comentarios.</p>
                    <small>¡Sé el primero en dar tu opinión sobre este apunte!</small>
                  </div>
                ) : (
                  comentarios.map((c) => {
                    const idComentario = c.id_comentario || c.id;
                    const esMio = idUsuarioLogueado && parseInt(c.id_usuario) === parseInt(idUsuarioLogueado);

                    return (
                      <div key={idComentario} className="comment-bubble">
                        <div className="comment-header">
                          <strong className="comment-author-name">
                            {c.usuario || c.nombre_completo || 'Estudiante Poli'}
                          </strong>

                          {esMio && (
                            <div className="comment-actions-btns">
                              <button
                                onClick={() => {
                                  setEditandoId(idComentario);
                                  setTextoEditado(c.contenido || c.texto);
                                }}
                                className="btn-icon-action edit"
                                title="Editar comentario"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleEliminarComentario(idComentario)}
                                className="btn-icon-action delete"
                                title="Eliminar comentario"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>

                        {editandoId === idComentario ? (
                          <div className="comment-edit-form">
                            <input
                              type="text"
                              value={textoEditado}
                              onChange={(e) => setTextoEditado(e.target.value)}
                              className="input-edit-comment"
                            />
                            <div className="edit-buttons-group">
                              <button onClick={() => handleGuardarEdicion(idComentario)} className="btn-save-sm">
                                Guardar
                              </button>
                              <button onClick={() => setEditandoId(null)} className="btn-cancel-sm">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="comment-text-body">{c.contenido || c.texto}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleEnviarComentario} className="add-comment-form">
                <input
                  type="text"
                  placeholder="Escribe un comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="input-new-comment"
                />
                <button type="submit" className="btn-send-comment">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}