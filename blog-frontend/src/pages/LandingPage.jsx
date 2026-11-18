import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', backgroundColor: '#f8fafc' }}>
      {/* Banner Hero Verde (Imagen 2) */}
      <section
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          padding: '4.5rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1150px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {/* Columna Izquierda */}
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: '700',
                letterSpacing: '0.5px',
                marginBottom: '1.2rem',
              }}
            >
              📚 COMUNIDAD UNIVERSITARIA
            </span>

            <h1
              style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                fontWeight: '900',
                lineHeight: '1.08',
                margin: '0 0 1.2rem 0',
              }}
            >
              Tus apuntes.
              <br />
              Organizados.
              <br />
              <span style={{ color: '#a7f3d0' }}>Sin esfuerzo.</span>
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.6',
                color: '#ecfdf5',
                margin: '0 0 2rem 0',
                maxWidth: '480px',
              }}
            >
              Explora, comparte y califica el mejor material de estudio académico del Poli en un solo lugar.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#065f46',
                  padding: '0.85rem 1.8rem',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.18)',
                }}
              >
                Comenzar gratis →
              </Link>

              <Link
                to="/login"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  padding: '0.85rem 1.8rem',
                  borderRadius: '999px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Destacada */}
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderRadius: '22px',
              padding: '2rem',
              boxShadow: '0 25px 45px -12px rgba(0, 0, 0, 0.22)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.3rem' }}>
              <div style={{ display: 'flex', gap: '0.45rem' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              </div>
              <span
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  padding: '0.28rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                }}
              >
                ⭐ Destacado
              </span>
            </div>

            <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              Estructuras de Datos & Algoritmos
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
              Resúmenes completos con diagramas, ejercicios resueltos y guías de examen.
            </p>

            <div
              style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                Por Estudiantes Poli
              </span>
              <span
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                }}
              >
                ★ 4.9
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios rápidos debajo del Hero */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '3rem auto',
          padding: '0 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', padding: '1.6rem', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>📄</div>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: '700' }}>Vista previa en PDF</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Revisa guías, parciales resueltos y talleres directamente en tu navegador antes de descargarlos.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.6rem', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>⭐</div>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: '700' }}>Recomendados para ti</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Encuentra al instante los apuntes mejor calificados por tus compañeros de carrera.
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.6rem', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>💬</div>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: '700' }}>Comunidad colaborativa</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Comenta dudas en cada publicación, chatea con autores y solicita nuevas materias.
          </p>
        </div>
      </section>
    </div>
  );
}