require('dotenv').config();
const pool = require('./src/config/db');

async function ejecutarPrueba10k() {
    console.log(' Iniciando prueba de estrés con 10.000 registros en Study Poli...\n');

    try {
        // 1. Obtener un usuario y una materia válidos existentes
        const [usuarios] = await pool.query('SELECT id_usuario FROM Usuarios LIMIT 1');
        const [materias] = await pool.query('SELECT id_materia FROM Materias LIMIT 1');

        if (usuarios.length === 0) {
            throw new Error('Debe existir al menos 1 usuario en la tabla Usuarios.');
        }

        // Detectar dinámicamente si la columna se llama 'descripcion' o 'contenido'
        const [columnas] = await pool.query('DESCRIBE Apuntes');
        const nombresColumnas = columnas.map((c) => c.Field);
        const colTexto = nombresColumnas.includes('descripcion')
            ? 'descripcion'
            : nombresColumnas.includes('contenido')
            ? 'contenido'
            : null;

        const idUsuario = usuarios[0].id_usuario;
        const idMateria = materias.length > 0 ? materias[0].id_materia : null;

        // 2. Medir latencia de consulta ANTES de los 10.000 registros
        const inicioSelectAntes = performance.now();
        await pool.query("SELECT * FROM Apuntes WHERE titulo LIKE '%Algoritmos%' LIMIT 50");
        const finSelectAntes = performance.now();
        console.log(` Latencia SELECT inicial: ${(finSelectAntes - inicioSelectAntes).toFixed(2)} ms`);

        // 3. Preparar 10.000 registros en memoria
        const totalRegistros = 10000;
        const loteTamano = 1000;
        const registros = [];

        for (let i = 1; i <= totalRegistros; i++) {
            const fila = [
                `Apunte de Prueba Rendimiento #${i} - Algoritmos y Estructuras`,
                ...(colTexto
                    ? [`Contenido autogenerado para evaluación de latencia en base de datos relacional (Registro ${i}).`]
                    : []),
                'sin_archivo.pdf',
                idUsuario,
                idMateria,
            ];
            registros.push(fila);
        }

        const sqlInsert = colTexto
            ? `INSERT INTO Apuntes (titulo, ${colTexto}, ruta_archivo, id_usuario, id_materia) VALUES ?`
            : `INSERT INTO Apuntes (titulo, ruta_archivo, id_usuario, id_materia) VALUES ?`;

        // 4. Medir latencia de INSERCIÓN masiva de los 10.000 datos (en lotes de 1.000)
        const inicioInsert = performance.now();
        for (let i = 0; i < registros.length; i += loteTamano) {
            const lote = registros.slice(i, i + loteTamano);
            await pool.query(sqlInsert, [lote]);
        }
        const finInsert = performance.now();
        const tiempoInsertMs = finInsert - inicioInsert;

        // 5. Medir latencia de consulta DESPUÉS de tener 10.000+ registros
        const inicioSelectDespues = performance.now();
        const [resultados] = await pool.query(
            "SELECT * FROM Apuntes WHERE titulo LIKE '%Algoritmos%' LIMIT 50"
        );
        const finSelectDespues = performance.now();
        const tiempoSelectDespuesMs = finSelectDespues - inicioSelectDespues;

        console.log('\n ================= RESULTADOS DE LATENCIA =================');
        console.log(` Total registros insertados: ${totalRegistros}`);
        console.log(` Latencia total de inserción (10.000 filas): ${tiempoInsertMs.toFixed(2)} ms (${(tiempoInsertMs / 1000).toFixed(2)} s)`);
        console.log(` Latencia promedio por registro: ${(tiempoInsertMs / totalRegistros).toFixed(4)} ms`);
        console.log(` Latencia SELECT con +10.000 registros: ${tiempoSelectDespuesMs.toFixed(2)} ms (${resultados.length} filas retornadas)`);
        console.log('=============================================================\n');

    } catch (error) {
        console.error(' Error durante la prueba:', error.message);
    } finally {
        process.exit();
    }
}

ejecutarPrueba10k();