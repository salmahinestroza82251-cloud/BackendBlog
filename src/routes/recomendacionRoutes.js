const express = require('express');
const router = express.Router();
const recomendacionController = require('../controllers/recomendacionController');
const { verificarToken } = require('../middlewares/authMiddleware');

// verifica que ambos parámetros después de '/feed' sean funciones válidas
router.get('/feed', verificarToken, recomendacionController.obtenerRecomendaciones);

module.exports = router;