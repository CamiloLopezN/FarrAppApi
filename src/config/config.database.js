const mongoose = require('mongoose');

const { MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_URL } = process.env;

const mongoOptions = {
  user: MONGO_USER,
  pass: MONGO_PASS,
  dbName: MONGO_DB,
  writeConcern: 'majority',
  retryWrites: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

// CONNECT TO DATABASE
mongoose
  .connect(MONGO_URL, mongoOptions)
  // eslint-disable-next-line no-console
  .then(() => console.log('Connected to Database!'))
  // eslint-disable-next-line no-console
  .catch((err) => console.log(err));
