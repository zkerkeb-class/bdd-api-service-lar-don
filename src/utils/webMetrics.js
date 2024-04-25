const client = require("prom-client");
const register = client.register;

client.collectDefaultMetrics();

exports.webMetrics =  async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}
