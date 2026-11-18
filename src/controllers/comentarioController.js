const pool = require('../config/db');

exports.calificarApunte = async (req, res, next) => {
    try {
        const { id_apunte } = req.params;
        const { valor, id_usuario } = req.body;
        const usuarioId = id_usuario || req.usuario?.id || 1;

        if (!valor || valor < 1 || valor > 5) {
            return res.status(400).json({ success: false, message: 'La calificación debe estar entre 1 y 5' });
        }

        // Insertar o actualizar la calificación en la base de datos
        const [existente] = await pool.query(
            'SELECT * FROM Calificaciones WHERE id_usuario = ? AND id_apunte = ?',
            [usuarioId, id_apunte]
        );

        if (existente.length > 0) {
            await pool.query(
                'UPDATE Calificaciones SET valor = ? WHERE id_usuario = ? AND id_apunte = ?',
                [valor, usuarioId, id_apunte]
            );
        } else {
            await pool.query(
                'INSERT INTO Calificaciones (id_usuario, id_apunte, valor) VALUES (?, ?, ?)',
                [usuarioId, id_apunte, valor]
            );
        }

        res.status(200).json({ success: true, message: '¡Calificación registrada!' });
    } catch (error) {
        console.error('Error al calificar:', error);
        next(error);
    }
};

// Publicar comentario
exports.crearComentario = async (req, res, next) => {
    try {
        const { id_apunte } = req.params;
        const { contenido, id_usuario: idUsuarioBody } = req.body;
        
        // Obtener ID del usuario logueado (desde el token o desde la sesión/body)
        const id_usuario = req.usuario?.id_usuario || req.usuario?.id || idUsuarioBody;

        if (!id_usuario) {
            return res.status(401).json({ 
                success: false, 
                message: 'No se pudo identificar al usuario. Inicia sesión para comentar.' 
            });
        }

        if (!contenido || !contenido.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'El contenido del comentario no puede estar vacío.' 
            });
        }

        const [result] = await pool.query(
            'INSERT INTO Comentarios (contenido, id_usuario, id_apunte) VALUES (?, ?, ?)',
            [contenido, id_usuario, id_apunte]
        );

        res.status(201).json({ success: true, id_comentario: result.insertId, message: 'Comentario agregado' });
    } catch (error) {
        console.error('Error al crear comentario:', error);
        next(error);
    }
};

//  Listar comentarios de un apunte
exports.obtenerComentarios = async (req, res, next) => {
    try {
        const { id_apunte } = req.params;
        const [comentarios] = await pool.query(
            `SELECT c.*, u.nombre_completo AS usuario 
             FROM Comentarios c 
             JOIN Usuarios u ON c.id_usuario = u.id_usuario 
             WHERE c.id_apunte = ? 
             ORDER BY c.fecha DESC`,
            [id_apunte]
        );
        res.status(200).json({ success: true, data: comentarios });
    } catch (error) {
        next(error);
    }
};


// Editar comentario existente
exports.editarComentario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { contenido, id_usuario: idUsuarioBody } = req.body;
        const id_usuario = req.usuario?.id_usuario || req.usuario?.id || idUsuarioBody;

        if (!contenido || !contenido.trim()) {
            return res.status(400).json({ success: false, message: 'El contenido no puede estar vacío.' });
        }

        // Verificar que el comentario pertenezca al usuario antes de editar
        const [comentario] = await pool.query('SELECT * FROM Comentarios WHERE id_comentario = ?', [id]);

        if (comentario.length === 0) {
            return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
        }

        if (comentario[0].id_usuario !== parseInt(id_usuario)) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para editar este comentario.' });
        }

        await pool.query('UPDATE Comentarios SET contenido = ? WHERE id_comentario = ?', [contenido, id]);

        res.status(200).json({ success: true, message: 'Comentario actualizado exitosamente.' });
    } catch (error) {
        console.error('Error al editar comentario:', error);
        next(error);
    }
};

// Eliminar comentario
exports.eliminarComentario = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM Comentarios WHERE id_comentario = ?', [id]);
        res.status(200).json({ success: true, message: 'Comentario eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        next(error);
    }
};