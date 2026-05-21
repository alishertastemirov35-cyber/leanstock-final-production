const service = require('../services/reservation.service');
exports.create = async (req, res) => res.status(201).json(await service.create(req.user, req.validated.body));
exports.cancel = async (req, res) => res.json(await service.cancel(req.user, req.params.id));
