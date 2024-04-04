let flaggedIps = [];

function blockFlaggedIps(req, res, next) {
  const clientIp = req.socket.remoteAddress;

  if (flaggedIps.includes(clientIp)) {
    return res.status(403).send({
      status: 403,
      message:
        "Votre adresse IP a été bloquée en raison d'activités suspectes.",
      success: false,
    });
  }

  next();
}

module.exports.default = blockFlaggedIps;
