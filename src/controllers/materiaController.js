const pool = require('../config/db');

// READ : Consultar todas las materias
exports.obtenerMaterias = async (req, res, next) => {
    try {
        const [materias] = await pool.query('SELECT * FROM Materias');
        res.status(200).json({ success: true, data: materias });
    } catch (error) {
        next(error);
    }
};

// CREATE : Crear una nueva materia
exports.crearMateria = async (req, res, next) => {
    try {
        const { nombre_materia, descripcion } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Materias (nombre_materia, descripcion) VALUES (?, ?)',
            [nombre_materia, descripcion]
        );
        res.status(201).json({ success: true, message: 'Materia creada', id_materia: result.insertId });
    } catch (error) {
        next(error);
    }
};

// UPDATE : Actualizar una materia
exports.actualizarMateria = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre_materia, descripcion } = req.body;
        await pool.query(
            'UPDATE Materias SET nombre_materia = ?, descripcion = ? WHERE id_materia = ?',
            [nombre_materia, descripcion, id]
        );
        res.status(200).json({ success: true, message: 'Materia actualizada exitosamente' });
    } catch (error) {
        next(error);
    }
};

// DELETE : Eliminar una materia
exports.eliminarMateria = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM Materias WHERE id_materia = ?', [id]);
        res.status(200).json({ success: true, message: 'Materia eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};