const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const apiRouter = require('./routes/index');
const cors = require('cors');
require('dotenv').config();
const { default: blockFlaggedIps } = require('./utils/blockFlaggedIps');
const { default: apiLimiter } = require('./utils/apiLimiter');
const { webMetrics } = require('./utils/webMetrics');
const jsonwebtoken = require('jsonwebtoken');
app.use(bodyParser.json());

app.use(cors());
app.use(blockFlaggedIps);
app.use(apiLimiter);

mongoose
  .connect(
    `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@${process.env.DBCLUSTER}.hu4mwmc.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority
  `
  )
  .then(() => {
    console.info('(mongodb) Connection successfull');
  })
  .catch((err) => console.error(err));

app.use(function (req, res, next) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    jsonwebtoken.verify(
      req.headers.authorization.split(' ')[1],
      'LARDON-SERVICES',
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});

app.get('/metrics', webMetrics);
app.use('/bdd-api', apiRouter);

app.listen(process.env.PORT, () => {
  console.info(`[BDD API] Serveur démarré sur le port ${process.env.PORT}`);
});
