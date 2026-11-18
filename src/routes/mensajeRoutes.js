const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, mensajeController.enviar);
router.get('/:id_receptor', verificarToken, mensajeController.obtenerChat);
router.post('/bloquear', verificarToken, mensajeController.bloquear);

module.exports = router;