const service = require('../services/forecast.service');
exports.reorder = async (req, res) => res.json(await service.reorder(req.user, req.query.locationId, Number(req.query.days || 30)));
