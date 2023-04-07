/*require("dotenv").config()
const express = require("express")
const cors = require('cors')
const app = express()

// Setup your Middleware and API Router here

app.use(cors())

app.get('/products/:id', function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for all origins!'})
})

app.listen(80, function () {
  console.log('CORS-enabled web server listening on port 80')
})

module.exports = app;*/

require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require('morgan');

app.use(morgan('dev'));
app.use(express.json());

const cors = require("cors");
app.use(cors());

// Setup your Middleware and API Router hereconst apiRouter = require('./api');
const apiRouter = require("./api");
app.use('/api', apiRouter);
const client = require("./db/client");
client.connect();
module.exports = app;
