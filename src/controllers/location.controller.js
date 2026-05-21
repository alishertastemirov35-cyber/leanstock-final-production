const service = require('../services/location.service');
exports.create = async (req, res) => res.status(201).json(await service.create(req.user, req.validated.body));
exports.list = async (req, res) => res.json(await service.list(req.user, req.query));
exports.get = async (req, res) => res.json(await service.get(req.user, req.params.id));
