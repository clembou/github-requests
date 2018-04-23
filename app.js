const FileStreamRotator = require('file-stream-rotator');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const cors = require('cors');
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
const config = require('./config');

const app = express();

app.use(cors());

const logDirectory = path.join(__dirname, 'log');

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
});

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// remove the automatically added `X-Powered-By` header
app.disable('x-powered-by');

// this needs to be added first so that headers are added to all subsequent responses
app.use(function(req, res, next) {
  // disable caching
  res.header('Cache-Control', 'no-cache, must-revalidate, max-age=0');
  res.header('Pragma', 'no-cache');

  // security headers
  // see https://www.owasp.org/index.php/OWASP_Secure_Headers_Project
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('X-Frame-Options', 'deny');
  res.header('X-Content-Type-Options', 'nosniff');

  next();
});

module.exports = app;
