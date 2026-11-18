const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

// 1. Importar todas las rutas
const authRoutes = require('./routes/authRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const apunteRoutes = require('./routes/apunteRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const recomendacionRoutes = require('./routes/recomendacionRoutes');

// 2. Inicializar la aplicación
const app = express();

// 3. Middlewares
//  Permite que los archivos estáticos (PDFs) se puedan abrir desde React (localhost:5173)
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  SERVIR LA CARPETA DE ARCHIVOS SUBIDOS (PDFs)
// Permite acceder a los PDFs guardados en /uploads desde la web (http://localhost:4000/uploads/...)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 4. HealthCheck
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API REST operando al 100%',
        timestamp: new Date().toISOString()
    });
});

// 5. Endpoints de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/apuntes', apunteRoutes);
app.use('/api/interacciones', comentarioRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/recomendaciones', recomendacionRoutes);

// 6. Manejo global de errores
app.use(errorHandler);

module.exports = app;