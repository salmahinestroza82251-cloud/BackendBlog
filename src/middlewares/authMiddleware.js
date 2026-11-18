const jwt = require('jsonwebtoken');

// Verificar si el token existe y es válido
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        req.usuario.id = decoded.id || decoded.id_usuario;
        req.usuario.id_usuario = decoded.id_usuario || decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, error: 'Token inválido o expirado.' });
    }
};

// Verificar si el usuario tiene el rol adecuado (RBAC)
const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolActual = (req.usuario?.rol || req.usuario?.role || '').toLowerCase();
    const permitidos = rolesPermitidos.map((r) => r.toLowerCase());
    if (permitidos.includes('administrador')) permitidos.push('admin');

    if (!rolActual || !permitidos.includes(rolActual)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes los permisos necesarios para realizar esta acción',
      });
    }
    next();
  };
};

module.exports = { verificarToken, autorizarRoles };