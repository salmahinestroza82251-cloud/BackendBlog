const mensajeService = require('../services/mensajeService');

exports.enviar = async (req, res, next) => {
    try {
        const { id_receptor, contenido } = req.body;
        const id_emisor = req.usuario.id_usuario || req.usuario.id;

        if (!id_emisor) {
            return res.status(401).json({ success: false, message: 'Usuario no identificado en el token' });
        }

        const resultado = await mensajeService.enviarMensaje(Number(id_emisor), Number(id_receptor), contenido);
        res.status(201).json({ success: true, data: resultado });
    } catch (error) {
        next(error);
    }
};

exports.obtenerChat = async (req, res, next) => {
    try {
        const { id_receptor } = req.params;
        const id_emisor = req.usuario.id_usuario || req.usuario.id;

        if (!id_emisor) {
            return res.status(401).json({ success: false, message: 'Usuario no identificado en el token' });
        }

        const chat = await mensajeService.obtenerChat(Number(id_emisor), Number(id_receptor));
        res.status(200).json({ success: true, data: chat });
    } catch (error) {
        next(error);
    }
};

exports.bloquear = async (req, res, next) => {
    try {
        const { id_usuario_bloqueado } = req.body;
        const id_bloqueador = req.usuario.id_usuario || req.usuario.id;

        const resultado = await mensajeService.bloquearUsuario(Number(id_bloqueador), Number(id_usuario_bloqueado));
        res.status(200).json({ success: true, ...resultado });
    } catch (error) {
        next(error);
    }
};