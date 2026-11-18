const reporteService = require('../services/reporteService');

exports.crear = async (req, res, next) => {
    try {
        const { tipo_reporte, motivo, id_objeto_reportado } = req.body;
        const id_reportante = req.usuario.id;

        const resultado = await reporteService.crearReporte(id_reportante, tipo_reporte, motivo, id_objeto_reportado);
        res.status(201).json({ success: true, data: resultado });
    } catch (error) {
        next(error);
    }
};

exports.listar = async (req, res, next) => {
    try {
        const reportes = await reporteService.obtenerReportes();
        res.status(200).json({ success: true, data: reportes });
    } catch (error) {
        next(error);
    }
};

exports.cambiarEstado = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'revisado', 'resuelto'

        const resultado = await reporteService.actualizarEstado(id, estado);
        res.status(200).json({ success: true, ...resultado });
    } catch (error) {
        next(error);
    }
};