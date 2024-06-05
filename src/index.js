require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const apiRouter = require('./routes/index');
const cors = require('cors');
const { blockFlaggedIps } = require('./utils/blockFlaggedIps');
const { apiLimiter } = require('./utils/apiLimiter');
const { webMetrics } = require('./utils/webMetrics');
const { verifyToken } = require('./utils/verifyToken');

app.use(bodyParser.json());

app.use(cors());
app.use(blockFlaggedIps);
app.use(apiLimiter);
app.use(verifyToken);

mongoose
  .connect(
    `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@${process.env.DBCLUSTER}.hu4mwmc.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority
  `
  )
  .then(() => {
    console.info('(mongodb) Connection successfull');
  })
  .catch((err) => console.error(err));

app.get('/metrics', webMetrics);
app.use('/bdd-api', apiRouter);

app.listen(process.env.PORT, () => {
  console.info(`[BDD API] Serveur démarré sur le port ${process.env.PORT}`);
});
