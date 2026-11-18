const pool = require('../config/db');
const { calcularScoreApunte, ordenarPorRecomendacion } = require('../utils/algoritmos');

class RecomendacionService {
    // Obtener Feed Personalizado utilizando Algoritmos de Recomendación y Ranking
    async obtenerFeedRecomendado(id_usuario, id_materia_filtro) {
        // Consulta SQL con agregaciones para obtener promedio de estrellas y número de votos
        const [apuntes] = await pool.query(`
            SELECT 
                a.*, 
                u.nombre_completo AS autor, 
                m.nombre_materia,
                AVG(c.valor) AS promedio_estrellas,
                COUNT(c.id_calificacion) AS total_votos
            FROM Apuntes a
            JOIN Usuarios u ON a.id_usuario = u.id_usuario
            JOIN Materias m ON a.id_materia = m.id_materia
            LEFT JOIN Calificaciones c ON a.id_apunte = c.id_apunte
            GROUP BY a.id_apunte
        `);

        // Calcular el Score de Calidad para cada apunte
        const apuntesConScore = apuntes.map(apunte => {
            const score = calcularScoreApunte(
                parseFloat(apunte.promedio_estrellas) || 0,
                parseInt(apunte.total_votos) || 0,
                apunte.fecha_subida
            );
            return {
                ...apunte,
                score_calidad: score,
                promedio_estrellas: apunte.promedio_estrellas ? Number(parseFloat(apunte.promedio_estrellas).toFixed(1)) : 0
            };
        });

        //  Ordenar y filtrar por el perfil/preferencia del estudiante
        const feedFinal = ordenarPorRecomendacion(apuntesConScore, parseInt(id_materia_filtro) || null);

        return feedFinal;
    }
}

module.exports = new RecomendacionService();