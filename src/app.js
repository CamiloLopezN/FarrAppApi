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

app.use('/api', require('./routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/companies', require('./routes/companies.routes'));
app.use('/api/admins', require('./routes/admins.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/clients', require('./routes/clients.routes'));

module.exports = app;
