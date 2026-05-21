const service = require('../services/sale.service');
exports.confirm = async (req, res) => res.status(201).json(await service.confirm(req.user, req.validated.body.reservationId));
exports.list = async (req, res) => res.json(await service.list(req.user));
