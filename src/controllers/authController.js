const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configurar transporter de Gmail con Contraseña de Aplicación
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// RF-01: Registro de Usuarios con envío de código de verificación
exports.registrar = async (req, res, next) => {
    try {
        const { nombre_completo, correo_institucional, contraseña, rol, admin_key } = req.body;

        if (!nombre_completo || !correo_institucional || !contraseña) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        const correoLimpio = correo_institucional.trim().toLowerCase();

        // Validación del Rol de Administrador
        let rolDefinitivo = 'estudiante';
        if (rol === 'admin') {
            if (admin_key === 'POLI_ADMIN_2026') {
                rolDefinitivo = 'admin';
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'La clave de autorización para administrador es incorrecta',
                });
            }
        }

        // Verificar si el correo ya existe en la BD
        const [usuarioExiste] = await pool.query(
            'SELECT id_usuario, verificado FROM Usuarios WHERE correo_institucional = ?',
            [correoLimpio]
        );

        // Generar código aleatorio de 6 dígitos
        const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(contraseña, salt);

        if (usuarioExiste.length > 0) {
            if (usuarioExiste[0].verificado === 1) {
                return res.status(400).json({ success: false, message: 'El correo ya está registrado y verificado' });
            }
            await pool.query(
                'UPDATE Usuarios SET nombre_completo = ?, contraseña = ?, rol = ?, codigo_verificacion = ? WHERE id_usuario = ?',
                [nombre_completo, passwordHash, rolDefinitivo, codigoVerificacion, usuarioExiste[0].id_usuario]
            );
        } else {
            await pool.query(
                'INSERT INTO Usuarios (nombre_completo, correo_institucional, contraseña, rol, verificado, codigo_verificacion) VALUES (?, ?, ?, ?, 0, ?)',
                [nombre_completo, correoLimpio, passwordHash, rolDefinitivo, codigoVerificacion]
            );
        }

        // Enviar correo con el código mediante Gmail (Nodemailer)
        try {
            await transporter.sendMail({
                from: `"Study Poli" <${process.env.EMAIL_USER}>`,
                to: correoLimpio,
                subject: 'Tu código de verificación - Study Poli',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
                        <h2 style="color: #059669; margin-bottom: 8px;">¡Bienvenido a Study Poli, ${nombre_completo}!</h2>
                        <p style="color: #334155; font-size: 15px;">Para confirmar que este correo es real y activar tu cuenta, ingresa el siguiente código en la plataforma:</p>
                        <div style="background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${codigoVerificacion}</span>
                        </div>
                        <p style="color: #64748b; font-size: 13px;">Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
                    </div>
                `,
            });
        } catch (errorEmail) {
            console.error('Error al enviar correo con Gmail:', errorEmail);
            return res.status(400).json({
                success: false,
                message: 'No se pudo enviar el correo de verificación. Revisa que el correo sea válido o intenta más tarde.',
            });
        }

        res.status(201).json({
            success: true,
            requiereVerificacion: true,
            message: 'Código enviado. Revisa tu correo para activar tu cuenta.',
        });
    } catch (error) {
        next(error);
    }
};

// Verificar código de 6 dígitos
exports.verificarCodigo = async (req, res, next) => {
    try {
        const { correo_institucional, codigo } = req.body;

        if (!correo_institucional || !codigo) {
            return res.status(400).json({ success: false, message: 'Correo y código son obligatorios' });
        }

        const [usuarios] = await pool.query(
            'SELECT id_usuario, codigo_verificacion, verificado FROM Usuarios WHERE correo_institucional = ?',
            [correo_institucional.trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const usuario = usuarios[0];

        if (usuario.verificado === 1) {
            return res.status(200).json({ success: true, message: 'La cuenta ya estaba verificada' });
        }

        if (usuario.codigo_verificacion !== codigo.trim()) {
            return res.status(400).json({ success: false, message: 'El código ingresado es incorrecto' });
        }

        await pool.query(
            'UPDATE Usuarios SET verificado = 1, codigo_verificacion = NULL WHERE id_usuario = ?',
            [usuario.id_usuario]
        );

        res.status(200).json({
            success: true,
            message: '¡Correo verificado exitosamente! Ya puedes iniciar sesión.',
        });
    } catch (error) {
        next(error);
    }
};

// RF-02: Inicio de Sesión
exports.login = async (req, res, next) => {
    try {
        const { correo_institucional, contraseña } = req.body;

        const [usuarios] = await pool.query(
            'SELECT * FROM Usuarios WHERE correo_institucional = ?',
            [correo_institucional.trim().toLowerCase()]
        );
        if (usuarios.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const usuario = usuarios[0];

        if (usuario.verificado === 0) {
            return res.status(403).json({
                success: false,
                message: 'Debes verificar tu correo con el código enviado antes de iniciar sesión',
            });
        }

        const esCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!esCorrecta) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

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
                rol: usuario.rol,
            },
        });
    } catch (error) {
        next(error);
    }
};