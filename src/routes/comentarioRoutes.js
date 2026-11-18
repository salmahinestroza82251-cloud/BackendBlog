const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Calificaciones
router.post('/:id_apunte/calificar', comentarioController.calificarApunte);

// Comentarios
router.post('/:id_apunte/comentarios', comentarioController.crearComentario);
router.get('/:id_apunte/comentarios', comentarioController.obtenerComentarios);
router.put('/comentarios/:id', comentarioController.editarComentario);
router.delete('/comentarios/:id', comentarioController.eliminarComentario);

module.exports = router;