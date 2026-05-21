const service = require('../services/auth.service');

exports.registerOwner = async (req, res) => res.status(201).json(await service.registerOwner(req.validated.body));
exports.verifyEmail = async (req, res) => res.json(await service.verifyEmail(req.validated.body));
exports.login = async (req, res) => res.json(await service.login(req.validated.body));
exports.refresh = async (req, res) => res.json(await service.refresh(req.validated.body.refreshToken));
exports.logout = async (req, res) => {
  await service.logout(req.body.refreshToken);
  res.status(204).send();
};
exports.forgotPassword = async (req, res) => res.json(await service.forgotPassword(req.validated.body.email));
exports.resetPassword = async (req, res) => res.json(await service.resetPassword(req.validated.body));
