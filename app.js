var FileStreamRotator = require('file-stream-rotator')
var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')
var passport = require('passport');
var cors = require('cors');
var OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
const config = require('./config');

var app = express()

app.use(cors())

//Load passport and configure it to use Azure AD Bearer auth
app.use(passport.initialize());
passport.use(new OIDCBearerStrategy(config.azure, function (token, done) {
  // console.log(token)
  return done(null, token, null);
}));

var logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

module.exports = app;
