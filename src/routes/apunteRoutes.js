const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const apunteController = require('../controllers/apunteController');

// Configuración de Cloudinary limpiando posibles espacios en blanco
cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'study_poli_apuntes',
    resource_type: 'auto',
  },
});

const upload = multer({ storage });

router.get('/', apunteController.obtenerApuntes);
router.post('/', upload.single('archivo'), apunteController.crearApunte);
router.delete('/:id', apunteController.eliminarApunte);

module.exports = router;