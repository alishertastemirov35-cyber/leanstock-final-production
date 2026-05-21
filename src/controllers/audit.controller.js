const service = require('../services/auditLog.service');
exports.list = async (req, res) => res.json(await service.list(req.user, req.query));
