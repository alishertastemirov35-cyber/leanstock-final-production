const service = require('../services/user.service');
exports.create = async (req, res) => res.status(201).json(await service.createUser(req.user, req.validated.body));
exports.list = async (req, res) => res.json(await service.listUsers(req.user));
