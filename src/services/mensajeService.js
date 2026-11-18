const pool = require('../config/db');

class MensajeService {
    async enviarMensaje(id_emisor, id_receptor, contenido) {
        // Verificar si existe bloqueo entre usuarios
        const [bloqueo] = await pool.query(
            `SELECT * FROM Bloqueos 
             WHERE (id_usuario_bloqueador = ? AND id_usuario_bloqueado = ?) 
                OR (id_usuario_bloqueador = ? AND id_usuario_bloqueado = ?)`,
            [id_emisor, id_receptor, id_receptor, id_emisor]
        );

        if (bloqueo.length > 0) {
            throw new Error('No es posible enviar el mensaje debido a un bloqueo entre usuarios.');
        }

        const [result] = await pool.query(
            'INSERT INTO Mensajes (id_emisor, id_receptor, contenido) VALUES (?, ?, ?)',
            [id_emisor, id_receptor, contenido]
        );

        return { id_mensaje: result.insertId, contenido };
    }

    async obtenerChat(id_usuario1, id_usuario2) {
        const [mensajes] = await pool.query(
            `SELECT * FROM Mensajes 
             WHERE (id_emisor = ? AND id_receptor = ?) 
                OR (id_emisor = ? AND id_receptor = ?) 
             ORDER BY fecha_envio ASC`,
            [id_usuario1, id_usuario2, id_usuario2, id_usuario1]
        );
        return mensajes;
    }

    async bloquearUsuario(id_bloqueador, id_bloqueado) {
        if (id_bloqueador === id_bloqueado) throw new Error('No te puedes bloquear a ti mismo.');

        await pool.query(
            'INSERT INTO Bloqueos (id_usuario_bloqueador, id_usuario_bloqueado) VALUES (?, ?)',
            [id_bloqueador, id_bloqueado]
        );

        return { message: 'Usuario bloqueado con éxito.' };
    }
}

module.exports = new MensajeService();