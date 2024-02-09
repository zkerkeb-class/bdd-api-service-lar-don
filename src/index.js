const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const apiRouter = require('./routes/index');
const cors = require('cors');
require('dotenv').config();


mongoose.set('strictQuery',false);
app.use(bodyParser.json());

app.use(cors());
mongoose.connect(`mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@${process.env.DBCLUSTER}.hu4mwmc.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority
`).then(()=>{
    console.log("Connection successfull");
}).catch(err=>console.error(err));


app.use('/bdd-api',apiRouter)
app.listen(process.env.PORT, () => {
    console.log(`Serveur démarré sur le port ${process.env.PORT}`);
});
