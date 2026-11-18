const pool = require('../config/db');

class ComentarioService {
    async calificarApunte(id_usuario, id_apunte, valor) {
        if (valor < 1 || valor > 5) {
            throw new Error('La calificación debe estar entre 1 y 5');
        }

        // Insertar o actualizar calificación (1 calificacion por usuario por apunte)
        const [existente] = await pool.query(
            'SELECT * FROM Calificaciones WHERE id_usuario = ? AND id_apunte = ?',
            [id_usuario, id_apunte]
        );

        if (existente.length > 0) {
            await pool.query(
                'UPDATE Calificaciones SET valor = ? WHERE id_usuario = ? AND id_apunte = ?',
                [valor, id_usuario, id_apunte]
            );
            return { message: 'Calificación actualizada' };
        } else {
            await pool.query(
                'INSERT INTO Calificaciones (id_usuario, id_apunte, valor) VALUES (?, ?, ?)',
                [id_usuario, id_apunte, valor]
            );
            return { message: 'Calificación registrada' };
        }
    }

    async agregarComentario(id_usuario, id_apunte, contenido) {
        if (!contenido) throw new Error('El comentario no puede estar vacío');

        const [result] = await pool.query(
            'INSERT INTO Comentarios (contenido, id_usuario, id_apunte) VALUES (?, ?, ?)',
            [contenido, id_usuario, id_apunte]
        );

        return { id_comentario: result.insertId, contenido };
    }

    async obtenerComentarios(id_apunte) {
        const [comentarios] = await pool.query(
            `SELECT c.*, u.nombre_completo AS usuario 
             FROM Comentarios c 
             JOIN Usuarios u ON c.id_usuario = u.id_usuario 
             WHERE c.id_apunte = ? 
             ORDER BY c.fecha DESC`,
            [id_apunte]
        );
        return comentarios;
    }
}

module.exports = new ComentarioService();