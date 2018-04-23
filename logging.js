const FileStreamRotator = require('file-stream-rotator');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');

const app = require('./app');

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