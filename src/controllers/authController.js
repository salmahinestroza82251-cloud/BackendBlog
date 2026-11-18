const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// RF-01: Registro de Usuarios
exports.registrar = async (req, res, next) => {
    try {
        const { nombre_completo, correo_institucional, contraseña, rol, admin_key } = req.body;

        // Validar campos requeridos
        if (!nombre_completo || !correo_institucional || !contraseña) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        // Validación del Rol de Administrador
        let rolDefinitivo = 'estudiante'; // Por defecto siempre es estudiante

        if (rol === 'admin') {
            // Validamos que la clave secreta enviada coincida con la autorizada
            if (admin_key === 'POLI_ADMIN_2026') {
                rolDefinitivo = 'admin';
            } else {
                return res.status(400).json({ 
                    success: false, 
                    message: 'La clave de autorización para administrador es incorrecta' 
                });
            }
        }

        // Verificar si el correo ya existe en la BD
        const [usuarioExiste] = await pool.query(
            'SELECT * FROM Usuarios WHERE correo_institucional = ?', 
            [correo_institucional]
        );
        if (usuarioExiste.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        // Encriptar contraseña con Bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(contraseña, salt);

        // Guardar en la BD con el rol definitivo validado
        const [result] = await pool.query(
            'INSERT INTO Usuarios (nombre_completo, correo_institucional, contraseña, rol) VALUES (?, ?, ?, ?)',
            [nombre_completo, correo_institucional, passwordHash, rolDefinitivo]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            usuarioId: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

// RF-02: Inicio de Sesión
exports.login = async (req, res, next) => {
    try {
        const { correo_institucional, contraseña } = req.body;

        const [usuarios] = await pool.query('SELECT * FROM Usuarios WHERE correo_institucional = ?', [correo_institucional]);
        if (usuarios.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const usuario = usuarios[0];

        // Validar contraseña cifrada
        const esCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!esCorrecta) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, rol: usuario.rol },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            success: true,
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                correo_institucional: usuario.correo_institucional,
                rol: usuario.rol
            }
        });
    } catch (error) {
        next(error);
    }
};