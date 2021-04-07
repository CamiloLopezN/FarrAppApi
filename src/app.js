const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require(`./config/config.database`);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/companies', require('./routes/companies.routes'));

module.exports = app;
