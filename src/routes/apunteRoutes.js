const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const apunteController = require('../controllers/apunteController');

// Configuración de Cloudinary con las variables de Railway
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de almacenamiento en la nube
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'study_poli_apuntes',
    resource_type: 'auto',
    allowed_formats: ['pdf'],
  },
});

const upload = multer({ storage });

// Rutas
router.get('/', apunteController.obtenerApuntes);
router.post('/', upload.single('archivo'), apunteController.crearApunte);
router.delete('/:id', apunteController.eliminarApunte);

module.exports = router;