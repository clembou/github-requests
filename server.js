'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');

// This doesn't work if moved in to a separate file, I don't know why
// set up environment variables from a `client\.env` if it exists (useful when developing)
const envPath = path.resolve(__dirname, 'client', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = require('./backend/app/app');

require('./backend/app/cors');

// this needs to be added early so that headers are added to all subsequent responses
require('./backend/app/headers');

// I think this has to be added before the routes, so that the routes get logged, but I'm not sure
require('./backend/app/logging');

require('./backend/authenticatedRoutes/authenticatedRoutes');
require('./backend/dangerousOpenRoutes/dangerousOpenRoutes');

// this has to happen last
require('./backend/app/listen');