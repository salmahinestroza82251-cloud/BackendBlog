import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/api';

export default function Register() {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo_institucional: '',
    contraseña: '',
    rol: 'estudiante', // Valor por defecto
    admin_key: '',    // Clave secreta si elige admin
  });
  const [error, setError] = useState('');
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

    // Validación local del código maestro de Administrador
    if (formData.rol === 'admin' && formData.admin_key !== 'POLI_ADMIN_2026') {
      const msg = 'La clave secreta de administrador es incorrecta';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      await API.post('/auth/registro', formData);
      toast.success('¡Cuenta creada con éxito! Inicia sesión para continuar. 🚀');
      navigate('/login');
    } catch (err) {
      const msgError = err.response?.data?.mensaje || err.response?.data?.message || 'Error al registrar el usuario';
      setError(msgError);
      toast.error(msgError);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '420px', margin: '2rem auto' }}>
      <div 
        style={{ 
          backgroundColor: 'var(--card-bg)', 
          padding: '2rem', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-color)' }}>
          Crear una Cuenta
        </h2>
        
        {error && (
          <p style={{ color: '#e11d48', backgroundColor: '#ffe4e6', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Nombre Completo</label>
            <input
              type="text"
              name="nombre_completo"
              placeholder="Tu nombre completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Correo Institucional</label>
            <input
              type="email"
              name="correo_institucional"
              placeholder="usuario@elpoli.edu.co"
              value={formData.correo_institucional}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Contraseña</label>
            <input
              type="password"
              name="contraseña"
              placeholder="••••••••"
              value={formData.contraseña}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            />
          </div>

          {/* Selector de Rol */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem' }}>Tipo de Usuario</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}
            >
              <option value="estudiante">Estudiante</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Campo condicional para clave de administrador */}
          {formData.rol === 'admin' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.9rem', color: '#b91c1c' }}>
                Clave de Autorización Admin
              </label>
              <input
                type="password"
                name="admin_key"
                placeholder="Ingresa la clave secreta"
                value={formData.admin_key}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2' }}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}