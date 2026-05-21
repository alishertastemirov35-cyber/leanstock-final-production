const service = require('../services/transfer.service');
exports.create = async (req, res) => res.status(201).json(await service.transfer(req.user, req.validated.body, req.ip));
