const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');
const { verificarToken, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/', materiaController.obtenerMaterias);
router.post('/', verificarToken, autorizarRoles('Administrador'), materiaController.crearMateria);
router.put('/:id', verificarToken, autorizarRoles('Administrador'), materiaController.actualizarMateria);
router.delete('/:id', verificarToken, autorizarRoles('Administrador'), materiaController.eliminarMateria);

module.exports = router;