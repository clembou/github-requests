require('dotenv').config()
var FileStreamRotator = require('file-stream-rotator')
var express = require('express')
var fs = require('fs')
var morgan = require('morgan')
var path = require('path')

var passport = require('passport');
var OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;

var app = express()

//Load passport and configure it to use Azure AD Bearer auth
app.use(passport.initialize());
passport.use(new OIDCBearerStrategy({
  "identityMetadata": process.env.IDENTITY_METADATA,
  //"audience": config.creds.audience,
  "clientID": process.env.REACT_APP_CLIENT_ID,
  "validateIssuer": false,
}, function (token, done) {
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

// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

module.exports = app;
