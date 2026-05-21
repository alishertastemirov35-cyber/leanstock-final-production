const service = require('../services/inventory.service');
exports.receive = async (req, res) => res.status(201).json(await service.receive(req.user, req.validated.body, req.ip));
exports.list = async (req, res) => res.json(await service.list(req.user, req.query));
