const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_fallback_poli';

const generarToken = (usuario) => {
    return jwt.sign(
        { 
            id_usuario: usuario.id_usuario, 
            rol: usuario.rol,
            correo: usuario.correo_institucional
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = { generarToken };