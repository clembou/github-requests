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

module.exports = app;
