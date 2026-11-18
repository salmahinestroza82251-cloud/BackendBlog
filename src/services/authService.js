const pool = require('../config/db'); 
const bcrypt = require('bcryptjs'); 
const { generarToken } = require('../utils/jwt');

class AuthService {
    async registrar({ nombre_completo, correo_institucional, contraseña, rol}) {
        const [usuarioExiste] = await pool.query('SELECT * FROM Usuarios Where correo_institucional = ?', [correo_institucional]);
        if (usuarioExiste.length > 0){
            throw new Error('El correo ya está registrado'); 
        }

        const salt = await bcrypt.genSalt(10); 
        const passwordHash = await bcrypt.hash(contraseña, salt); 

        const [result] = await pool.query( 
            'INSERT INTO Usuarios (nombre_completo, correo_institucional, contraseña, rol) VALUES (?,?,?,?)', 
            [nombre_completo, correo_institucional, passwordHash, rol || 'Estudiante']
        ); 

        return {id_usuario: result.insertId, nombre_completo, correo_institucional, rol: rol || 'Estudiante'}; 
    
    }

    async login ({ correo_institucional, contraseña}) {
        const [usuarios] = await pool.query('SELECT * FROM Usuarios WHERE correo_institucional =?', [correo_institucional]); 
        if (usuarios.length === 0) {
            throw new Error('Credenciales inválidas'); 
        }

        const usuario = usuarios[0]; 
        const esCorrecta = await bcrypt.compare(contraseña, usuario.contraseña); 

        if(!esCorrecta) {
            throw new Error('Credenciales inválidas'); 
        }

        const token = generarToken(usuario); 

        return {
            token, 
            usuario: {
                id_usuario: usuario.id_usuario, 
                nombre_completo: usuario.nombre_completo, 
                correo_institucional: usuario.correo_institucional, 
                rol: usuario.rol
            }
        };
    }
}

module.exports = new AuthService(); 