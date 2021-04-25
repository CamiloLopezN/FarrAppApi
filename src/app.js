const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require(`./config/config.database`);

app.use('/', require('./routes'));
app.use('/users', require('./routes/users.routes'));
app.use('/companies', require('./routes/companies.routes'));
app.use('/admins', require('./routes/admins.routes'));
app.use('/payments', require('./routes/payments.routes'));

module.exports = app;
