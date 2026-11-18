const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

// Cualquier usuario autenticado puede enviar un reporte
router.post('/', verificarToken, reporteController.crear);

// Solo Administradores pueden ver y gestionar reportes
router.get('/', verificarToken, autorizarRoles('Administrador'), reporteController.listar);
router.put('/:id', verificarToken, autorizarRoles('Administrador'), reporteController.cambiarEstado);

module.exports = router;