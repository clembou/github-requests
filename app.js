const FileStreamRotator = require('file-stream-rotator');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
//const passport = require('passport');
const cors = require('cors');
//const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
const config = require('./config');

const app = express();

app.use(cors());

//Load passport and configure it to use Azure AD Bearer auth
//app.use(passport.initialize());
// passport.use(new OIDCBearerStrategy(config.azure, function(token, done) {
//   // console.log(token)
//   return done(null, token, null);
// }));

//const authentication = require('./middleware/authentication')(app);

//const router = express.Router();
//router.use(authentication);

//require('./middleware/authorization')(router);

//app.use('/', router);

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

module.exports = app;
