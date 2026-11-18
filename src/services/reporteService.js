const pool = require('../config/db');

class ReporteService {
    async crearReporte(id_usuario_reportante, tipo_reporte, motivo, id_objeto_reportado) {
        const [result] = await pool.query(
            'INSERT INTO Reportes (tipo_reporte, motivo, id_usuario_reportante, id_objeto_reportado) VALUES (?, ?, ?, ?)',
            [tipo_reporte, motivo, id_usuario_reportante, id_objeto_reportado]
        );
        return { id_reporte: result.insertId, estado: 'pendiente' };
    }

    async obtenerReportes() {
        const [reportes] = await pool.query(
            `SELECT r.*, u.nombre_completo AS reportante 
             FROM Reportes r 
             JOIN Usuarios u ON r.id_usuario_reportante = u.id_usuario 
             ORDER BY r.id_reporte DESC`
        );
        return reportes;
    }

    async actualizarEstado(id_reporte, estado) {
        await pool.query('UPDATE Reportes SET estado = ? WHERE id_reporte = ?', [estado, id_reporte]);
        return { message: `Reporte actualizado a ${estado}` };
    }
}

module.exports = new ReporteService();