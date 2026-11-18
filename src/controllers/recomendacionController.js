const recomendacionService = require('../services/recomendacionService');

exports.obtenerRecomendaciones = async (req, res, next) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_materia } = req.query;

        const resultado = await recomendacionService.obtenerFeedRecomendado(id_usuario, id_materia);

        res.status(200).json({
            success: true,
            algoritmo: 'Ponderación de Calidad + Recomendación por Interés de Materia',
            total: resultado.length,
            data: resultado
        });
    } catch (error) {
        next(error);
    }
};