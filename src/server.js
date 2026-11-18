require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

process.on('SIGINT', async () => {
    console.log('Cerrando servidor...');
    await pool.end();
    server.close(() => {
        console.log('Proceso terminado.');
        process.exit(0);
    });
});