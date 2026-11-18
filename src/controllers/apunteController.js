const pool = require('../config/db');

exports.crearApunte = async (req, res, next) => {
    try {
        const { titulo, contenido, descripcion, materia, id_usuario, id_materia } = req.body;

        // Obtener texto del apunte
        const textoContenido = contenido || descripcion || '';

        // Con CloudinaryStorage, req.file.path contiene la URL pública completa (https://res.cloudinary.com/...)
        const ruta_archivo = req.file ? req.file.path : null;

        // Asignación segura del ID de usuario
        const usuarioId = id_usuario || 1;

        // Buscar el id_materia correspondiente al nombre seleccionado si no viene id_materia
        let materiaId = id_materia || null;
        if (!materiaId && materia) {
            const [rowsMateria] = await pool.query(
                'SELECT id_materia FROM Materias WHERE nombre_materia = ? LIMIT 1',
                [materia.trim()]
            );
            if (rowsMateria.length > 0) {
                materiaId = rowsMateria[0].id_materia;
            }
        }
        if (!materiaId) materiaId = 1;

        const [result] = await pool.query(
            'INSERT INTO Apuntes (titulo, descripcion, ruta_archivo, id_usuario, id_materia) VALUES (?, ?, ?, ?, ?)',
            [titulo, textoContenido, ruta_archivo, usuarioId, materiaId]
        );

        res.status(201).json({
            success: true,
            message: 'Apunte publicado exitosamente',
            id_apunte: result.insertId,
            ruta_archivo,
        });
    } catch (error) {
        console.error('Error detallado al crear apunte:', error);
        next(error);
    }
};

exports.obtenerApuntes = async (req, res, next) => {
    try {
        const { buscar } = req.query;
        let query = `
            SELECT a.*, a.descripcion AS contenido, u.nombre_completo AS autor, m.nombre_materia AS materia 
            FROM Apuntes a
            LEFT JOIN Usuarios u ON a.id_usuario = u.id_usuario
            LEFT JOIN Materias m ON a.id_materia = m.id_materia
        `;
        let params = [];

        if (buscar) {
            query += ` WHERE a.titulo LIKE ? OR m.nombre_materia LIKE ?`;
            const busquedaTermino = `%${buscar}%`;
            params = [busquedaTermino, busquedaTermino];
        }

        query += ' ORDER BY a.id_apunte DESC';

        const [apuntes] = await pool.query(query, params);
        res.status(200).json({ success: true, data: apuntes });
    } catch (error) {
        console.error('Error al obtener apuntes:', error);
        next(error);
    }
};

exports.eliminarApunte = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM Apuntes WHERE id_apunte = ?', [id]);
        res.status(200).json({ success: true, message: 'Apunte eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};