const mongoose = require('mongoose');
const debug = require('debug')('farrapp-api:mongodb');

const { MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_URL } = process.env;

const mongoOptions = {
  user: MONGO_USER,
  pass: MONGO_PASS,
  dbName: MONGO_DB,
  writeConcern: 'majority',
  retryWrites: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
};

// CONNECT TO DATABASE
mongoose
  .connect(MONGO_URL, mongoOptions)
  .then(() => debug('Connected to Database!'))
  .catch((err) => debug(err));

module.exports = mongoose;
