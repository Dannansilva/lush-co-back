require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var staffRouter = require('./routes/staff');
var dashboardRouter = require('./routes/dashboard');
var appointmentsRouter = require('./routes/appointments');
var customersRouter = require('./routes/customers');
var servicesRouter = require('./routes/services');
var revenueRouter = require('./routes/revenue');
var packagesRouter = require('./routes/packages');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Enable CORS with configuration from .env
const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true'
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/staff', staffRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/revenue', revenueRouter);
app.use('/api/packages', packagesRouter);

// Import custom error handler
const errorHandler = require('./middleware/errorHandler');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorHandler);

module.exports = app;
