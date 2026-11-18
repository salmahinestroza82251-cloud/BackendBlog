import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API from '../api/api';
import './NotesPage.css';

export default function NotesPage() {
  const { user, token } = useContext(AuthContext);
  const [apuntes, setApuntes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [vistaAdmin, setVistaAdmin] = useState('apuntes'); // 'apuntes' | 'materias' | 'reportes'

  const [formData, setFormData] = useState({
    titulo: '',
    materia: '',
    contenido: '',
  });
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [filtro, setFiltro] = useState('recientes');

  // Formulario de creación de materias (Solo Admin)
  const [nuevaMateria, setNuevaMateria] = useState({
    nombre_materia: '',
    descripcion: '',
  });

  const obtenerUsuarioActual = () => {
    if (user && (user.id_usuario || user.id)) return user;
    try {
      const guardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (guardado.id_usuario || guardado.id) return guardado;

      const jwt = token || localStorage.getItem('token');
      if (jwt) {
        return JSON.parse(atob(jwt.split('.')[1]));
      }
      return {};
    } catch {
      return {};
    }
  };

  const usuarioActivo = obtenerUsuarioActual();
  const idUsuarioLogueado = usuarioActivo.id_usuario || usuarioActivo.id || null;
  const rolUsuario = (usuarioActivo.rol || usuarioActivo.role || '').toLowerCase();
  const esAdmin = rolUsuario === 'admin' || rolUsuario === 'administrador';

  // Cargar catálogo oficial de materias desde el backend
  const cargarMaterias = async () => {
    try {
      const res = await API.get('/materias');
      const lista = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setMaterias(lista);
    } catch (err) {
      console.error('Error al cargar materias:', err);
      setMaterias([]);
    }
  };

  // Cargar publicaciones
  const cargarApuntes = async () => {
    try {
      const res = await API.get('/apuntes');
      let lista = [];
      if (Array.isArray(res.data)) {
        lista = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        lista = res.data.data;
      } else if (res.data && Array.isArray(res.data.apuntes)) {
        lista = res.data.apuntes;
      }

      if (idUsuarioLogueado && !esAdmin) {
        lista = lista.filter((item) => {
          const idOwner = item.id_usuario || item.usuario_id;
          return parseInt(idOwner) === parseInt(idUsuarioLogueado);
        });
      }

      setApuntes(lista);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
      setApuntes([]);
    }
  };

  // Cargar reportes y PQR (Solo si es Administrador)
  const cargarReportes = async () => {
    if (!esAdmin) return;
    try {
      const res = await API.get('/reportes');
      const lista = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.data?.reportes || []);
      setReportes(lista);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setReportes([]);
    }
  };

  useEffect(() => {
    cargarMaterias();
    cargarApuntes();
    if (esAdmin) {
      cargarReportes();
    }
  }, [idUsuarioLogueado, esAdmin]);

  // Crear nueva materia (Solo Administrador)
  const handleCrearMateria = async (e) => {
    e.preventDefault();
    if (!nuevaMateria.nombre_materia.trim()) return;

    try {
      await API.post('/materias', {
        nombre_materia: nuevaMateria.nombre_materia.trim(),
        descripcion: nuevaMateria.descripcion.trim() || 'Asignatura oficial del programa',
      });
      toast.success('¡Materia creada exitosamente! 📚');
      setNuevaMateria({ nombre_materia: '', descripcion: '' });
      cargarMaterias();
    } catch (err) {
      console.error('Error al crear materia:', err);
      toast.error(err.response?.data?.message || 'No se pudo crear la materia');
    }
  };

  // Eliminar materia (Solo Administrador)
  const handleEliminarMateria = async (idMateria) => {
    if (!window.confirm('¿Deseas eliminar esta materia del catálogo?')) return;
    try {
      await API.delete(`/materias/${idMateria}`);
      toast.success('Materia eliminada');
      cargarMaterias();
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      toast.error('No se puede eliminar la materia porque tiene apuntes asociados');
    }
  };

  // Cambiar estado de un reporte o PQR
  const handleCambiarEstadoReporte = async (idReporte, nuevoEstado) => {
    try {
      await API.put(`/reportes/${idReporte}`, { estado: nuevoEstado });
      toast.success(`Solicitud marcada como "${nuevoEstado}"`);
      cargarReportes();
    } catch (err) {
      console.error('Error al actualizar reporte:', err);
      toast.error('No se pudo actualizar el estado');
    }
  };

  // Calificar apunte
  const handleCalificar = async (idApunte, estrellas) => {
    if (!idUsuarioLogueado) {
      toast.error('Por favor inicia sesión para poder calificar.');
      return;
    }

    try {
      await API.post(`/interacciones/${idApunte}/calificar`, {
        valor: estrellas,
        id_usuario: idUsuarioLogueado,
      });
      toast.success(`¡Calificaste con ${estrellas} estrellas! ⭐`);
      cargarApuntes();
    } catch (err) {
      console.error('Error al calificar:', err);
      toast.error('No se pudo guardar la calificación');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos en formato PDF');
        setArchivoPDF(null);
        e.target.value = '';
        return;
      }
      setArchivoPDF(file);
    }
  };

  // Guardar nuevo apunte
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idUsuarioLogueado) {
      toast.error('Debes iniciar sesión para publicar un apunte');
      return;
    }

    if (!formData.materia) {
      toast.error('Por favor selecciona una materia oficial del listado');
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('titulo', formData.titulo);
    dataToSend.append('materia', formData.materia);
    dataToSend.append('contenido', formData.contenido);
    dataToSend.append('id_usuario', idUsuarioLogueado);

    if (archivoPDF) {
      dataToSend.append('archivo', archivoPDF);
    }

    try {
      await API.post('/apuntes', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('¡Apunte y archivo PDF publicados exitosamente! 📚');
      setFormData({ titulo: '', materia: '', contenido: '' });
      setArchivoPDF(null);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      cargarApuntes();
    } catch (err) {
      console.error('Error al publicar:', err);
      toast.error('Error al publicar el apunte');
    }
  };

  const handleEliminarApunte = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este apunte?')) return;

    try {
      await API.delete(`/apuntes/${id}`);
      toast.success('Apunte eliminado exitosamente');
      cargarApuntes();
    } catch (err) {
      console.error('Error al eliminar apunte:', err);
      toast.error('No se pudo eliminar el apunte');
    }
  };

  const getPdfUrl = (pdfUrl) => {
    if (!pdfUrl || pdfUrl === 'sin_archivo.pdf') return null;
    if (pdfUrl.startsWith('http')) return pdfUrl;
    const host = window.location.hostname || 'localhost';
    const backendUrl = import.meta.env.VITE_API_URL || `http://${host}:4000`;
    return `${backendUrl}${pdfUrl}`;
  };

  const apuntesOrdenados = [...apuntes].sort((a, b) => {
    if (filtro === 'mejores') {
      const promA = Number(a.promedio_estrellas || 0);
      const promB = Number(b.promedio_estrellas || 0);
      return promB - promA;
    } else {
      const idA = a.id_apunte || a.id || 0;
      const idB = b.id_apunte || b.id || 0;
      return idB - idA;
    }
  });

  const reportesPendientes = reportes.filter((r) => (r.estado || 'pendiente') === 'pendiente').length;

  return (
    <div className="notes-page-wrapper">
      {/* Banner y Pestañas Modo Admin */}
      {esAdmin && (
        <div
          className="admin-status-banner"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}
        >
          <span>🛡️ Privilegios de Administrador</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setVistaAdmin('apuntes')}
              className={`filter-btn ${vistaAdmin === 'apuntes' ? 'active' : ''}`}
            >
              📄 Apuntes
            </button>
            <button
              type="button"
              onClick={() => setVistaAdmin('materias')}
              className={`filter-btn ${vistaAdmin === 'materias' ? 'active' : ''}`}
            >
              📚 Materias ({materias.length})
            </button>
            <button
              type="button"
              onClick={() => setVistaAdmin('reportes')}
              className={`filter-btn ${vistaAdmin === 'reportes' ? 'active' : ''}`}
            >
              🚩 Reportes y PQR ({reportesPendientes})
            </button>
          </div>
        </div>
      )}

      {/* PESTAÑA 1 (ADMIN): GESTIÓN DE MATERIAS OFICIALES */}
      {esAdmin && vistaAdmin === 'materias' ? (
        <section className="notes-feed">
          <header className="notes-page-header">
            <h1>Gestión de Materias Oficiales</h1>
            <p>Crea y administra las asignaturas disponibles para que los estudiantes publiquen apuntes.</p>
          </header>

          <section className="publish-card">
            <div className="publish-card-header">
              <span className="card-icon">➕</span>
              <h2>Registrar Nueva Materia</h2>
            </div>
            <form onSubmit={handleCrearMateria} className="publish-form">
              <div className="form-grid-two">
                <div className="form-group">
                  <label>Nombre de la Materia</label>
                  <input
                    type="text"
                    placeholder="Ej: Cálculo Diferencial"
                    value={nuevaMateria.nombre_materia}
                    onChange={(e) => setNuevaMateria({ ...nuevaMateria, nombre_materia: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción corta</label>
                  <input
                    type="text"
                    placeholder="Ej: Ciencias Básicas - Semestre I"
                    value={nuevaMateria.descripcion}
                    onChange={(e) => setNuevaMateria({ ...nuevaMateria, descripcion: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-submit-notes">
                ✅ Guardar Materia
              </button>
            </form>
          </section>

          {materias.map((mat) => (
            <article key={mat.id_materia || mat.id} className="note-item-card">
              <div className="note-card-header">
                <div>
                  <h3 className="note-title">{mat.nombre_materia}</h3>
                  <p className="note-body-text" style={{ margin: '0.3rem 0 0 0' }}>
                    {mat.descripcion || 'Asignatura registrada'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarMateria(mat.id_materia || mat.id)}
                  className="btn-admin-delete"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : esAdmin && vistaAdmin === 'reportes' ? (
        /* PESTAÑA 2 (ADMIN): BANDEJA DE REPORTES Y PQR */
        <section className="notes-feed">
          <header className="notes-page-header">
            <h1>Bandeja de Reportes y PQR</h1>
            <p>Atiende las solicitudes de creación de materias, quejas y reportes de apuntes enviados por la comunidad.</p>
          </header>

          {reportes.length === 0 ? (
            <div className="empty-notes-card">
              <span className="empty-icon">✅</span>
              <p>No hay reportes ni PQR pendientes en este momento.</p>
            </div>
          ) : (
            reportes.map((rep) => {
              const idRep = rep.id_reporte || rep.id;
              const estadoActual = rep.estado || 'pendiente';
              const tipo = rep.tipo_reporte || 'apunte';
              const esPqr = tipo !== 'apunte';

              return (
                <article key={idRep} className="note-item-card">
                  <div className="note-card-header">
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span
                          className="materia-badge"
                          style={{
                            backgroundColor: esPqr ? '#e0e7ff' : '#fee2e2',
                            color: esPqr ? '#3730a3' : '#991b1b',
                          }}
                        >
                          {tipo.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className="materia-badge"
                          style={{
                            backgroundColor: estadoActual === 'pendiente' ? '#fef3c7' : '#dcfce7',
                            color: estadoActual === 'pendiente' ? '#b45309' : '#15803d',
                          }}
                        >
                          Estado: {estadoActual.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="note-title">
                        {esPqr
                          ? 'Solicitud / PQR de Estudiante'
                          : `Reporte sobre Apunte #${rep.id_objeto_reportado || rep.id_apunte}`}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {estadoActual === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => handleCambiarEstadoReporte(idRep, 'resuelto')}
                          className="btn-submit-notes"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginTop: 0 }}
                        >
                          ✅ Marcar Resuelto
                        </button>
                      )}
                      {!esPqr && (rep.id_objeto_reportado || rep.id_apunte) && (
                        <button
                          type="button"
                          onClick={() => handleEliminarApunte(rep.id_objeto_reportado || rep.id_apunte)}
                          className="btn-admin-delete"
                        >
                          🗑️ Eliminar Apunte
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="note-body-text">
                    <strong>Mensaje:</strong> {rep.motivo || rep.descripcion}
                  </p>
                </article>
              );
            })
          )}
        </section>
      ) : (
        /* PESTAÑA PRINCIPAL: PUBLICAR Y VER APUNTES */
        <>
          <header className="notes-page-header">
            <h1>{esAdmin ? 'Moderación y Centro de Apuntes' : 'Mis Apuntes Publicados'}</h1>
            <p>
              {esAdmin
                ? 'Administra todas las publicaciones de la comunidad o comparte nuevo material.'
                : 'Gestiona las publicaciones que has compartido y sube nuevo material de estudio.'}
            </p>
          </header>

          <section className="publish-card">
            <div className="publish-card-header">
              <span className="card-icon">✍️</span>
              <h2>Subir un Nuevo Apunte</h2>
            </div>

            <form onSubmit={handleSubmit} className="publish-form">
              <div className="form-grid-two">
                <div className="form-group">
                  <label>Título del Apunte</label>
                  <input
                    type="text"
                    name="titulo"
                    placeholder="Ej: Normalización de Bases de Datos I"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Materia Oficial</label>
                  <select
                    name="materia"
                    value={formData.materia}
                    onChange={handleChange}
                    required
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                    }}
                  >
                    <option value="">-- Selecciona una materia --</option>
                    {materias.map((mat) => (
                      <option key={mat.id_materia || mat.id} value={mat.nombre_materia}>
                        {mat.nombre_materia}
                      </option>
                    ))}
                  </select>
                  {materias.length === 0 && (
                    <small style={{ color: '#e11d48', marginTop: '0.2rem' }}>
                      No hay materias creadas aún. Solicítala en el botón "📩 PQR / Materias".
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Descripción / Contenido resumido</label>
                <textarea
                  name="contenido"
                  placeholder="Escribe una breve síntesis o los puntos clave que incluye este apunte..."
                  value={formData.contenido}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label>Adjuntar Documento PDF (Opcional)</label>
                <div className={`file-dropzone ${archivoPDF ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    id="pdf-file-input"
                  />
                  <label htmlFor="pdf-file-input" className="file-dropzone-label">
                    <span className="upload-icon">📄</span>
                    {archivoPDF ? (
                      <span className="file-name">
                        Documento seleccionado: <strong>{archivoPDF.name}</strong>
                      </span>
                    ) : (
                      <span>
                        Haz clic aquí para seleccionar tu archivo <strong>PDF</strong>
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-submit-notes">
                🚀 Publicar Apunte
              </button>
            </form>
          </section>

          <div className="notes-filter-bar">
            <div className="filter-title-label">
              <span>Ordenar por:</span>
            </div>
            <div className="filter-buttons-group">
              <button
                type="button"
                className={`filter-btn ${filtro === 'mejores' ? 'active' : ''}`}
                onClick={() => setFiltro('mejores')}
              >
                ⭐ Los Mejores Calificados
              </button>
              <button
                type="button"
                className={`filter-btn ${filtro === 'recientes' ? 'active' : ''}`}
                onClick={() => setFiltro('recientes')}
              >
                🕒 Apuntes Recientes
              </button>
            </div>
          </div>

          <section className="notes-feed">
            {apuntesOrdenados.length === 0 ? (
              <div className="empty-notes-card">
                <span className="empty-icon">📂</span>
                <p>No hay apuntes disponibles en este momento.</p>
              </div>
            ) : (
              apuntesOrdenados.map((item) => {
                const idApunte = item.id_apunte || item.id;
                const pdfUrl = item.ruta_archivo || item.url_pdf;
                const fullPdfUrl = getPdfUrl(pdfUrl);

                return (
                  <article key={idApunte} className="note-item-card">
                    <div className="note-card-header">
                      <div>
                        <span className="materia-badge">
                          {item.nombre_materia || item.materia || 'General'}
                        </span>
                        <h3 className="note-title">{item.titulo}</h3>
                      </div>

                      <button
                        type="button"
                        className="btn-admin-delete"
                        onClick={() => handleEliminarApunte(idApunte)}
                        title="Eliminar este apunte"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>

                    <p className="note-body-text">{item.contenido || item.descripcion}</p>

                    {fullPdfUrl && (
                      <div className="pdf-link-container">
                        <a
                          href={fullPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="pdf-download-badge"
                        >
                          📎 Ver / Descargar documento PDF adjunto
                        </a>
                      </div>
                    )}

                    <div className="note-card-footer">
                      <div className="rating-interactive-box">
                        <span className="rating-label">Calificar:</span>
                        <div className="stars-buttons-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleCalificar(idApunte, star)}
                              className="star-vote-btn"
                              title={`Votar con ${star} estrellas`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rating-score-pill">
                        <span className="star-symbol">★</span>
                        <strong>
                          {item.promedio_estrellas ? Number(item.promedio_estrellas).toFixed(1) : '5.0'}
                        </strong>
                        <span className="score-max">/ 5</span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </>
      )}
    </div>
  );
}