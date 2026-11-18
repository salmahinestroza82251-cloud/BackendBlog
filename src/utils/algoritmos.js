// Ranking de calidad
exports.calcularScoreApunte = (promedioCalificacion, totalCalificaciones, fechaSubida) => {
    const W_CALIFICACION = 0.5; 
    const W_POPULARIDAD = 0.3;  
    const W_RECENCIA = 0.2; 

const scoreCalificacion = promedioCalificacion ? (promedioCalificacion/5) : 0; 

const scorePopularidad = Math.min(Math.log10(totalCalificaciones + 1) / 2, 1);

// Que tan reciente es?
const diaDesdeSubida = (new Date() - new Date(fechaSubida)) / (1000 * 60 * 60 *24); 
const scoreRecencia = Math.max(0, 1 - (diaDesdeSubida / 180)); //pierde peso después de 6 meses

const scoreFinal = (scoreCalificacion * W_CALIFICACION +
    scorePopularidad * W_POPULARIDAD +
    scoreRecencia * W_RECENCIA) * 100; 

    return Math.round(scoreFinal * 100) /100;

};

exports.ordenarPorRecomendacion = (apuntes, id_MateriaPreferencia) => {
    return apuntes.sort((a,b) => {
        // priorizar los apuntes de la materia que más prefiera el usuario
        const coincideMateriaA = a.id_materia === id_MateriaPreferencia ? 15 : 0;
        const coincideMateriaB = b.id_materia === id_MateriaPreferencia ? 15 : 0; 

        const totalScoreA = (a.score_calidad || 0) + coincideMateriaA;
        const totalScoreB = (b.score_calidad || 0) + coincideMateriaB;

        return totalScoreB - totalScoreA; // orden descendente
    });
};
