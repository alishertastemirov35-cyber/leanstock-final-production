const service = require('../services/product.service');
exports.create = async (req, res) => res.status(201).json(await service.create(req.user, req.validated.body, req.ip));
exports.list = async (req, res) => res.json(await service.list(req.user, req.query));
exports.get = async (req, res) => res.json(await service.get(req.user, req.params.id));
exports.update = async (req, res) => res.json(await service.update(req.user, req.params.id, req.validated.body, req.ip));
exports.archive = async (req, res) => res.json(await service.archive(req.user, req.params.id, req.ip));
