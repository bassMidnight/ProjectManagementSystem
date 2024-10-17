var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

const session = require("express-session");
const sessionKey = process.env.COOKIE_SECRET || 'ud6ItPSJHaTHDhdZ';

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api.js');
var projectRouter = require('./routes/project');
var employeeRouter = require('./routes/employee');
var workloadRouter = require('./routes/workload');
var skillRouter = require('./routes/skill');
var seniorRouter = require('./routes/senior');
var adminRouter = require('./routes/admin');
var memberRouter = require('./routes/member');
var authRouter = require('./routes/auth');
var app = express();
var cors = require('cors');
app.use(cors());
app.use(session ({
  secret: sessionKey,
  resave: false,
  saveUninitialized: false,
  cookie: {  
      secure: false,
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000
  },
}));
require('./db.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/', indexRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/api', apiRouter);
app.use('/api/v1/project', projectRouter);
app.use('/api/v1/employee', employeeRouter);
app.use('/api/v1/workload', workloadRouter);
app.use('/api/v1/skill', skillRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/senior', seniorRouter);
app.use('/api/v1/member', memberRouter);
app.use('/api/v1/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
