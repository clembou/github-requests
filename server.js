'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');

// set up environment variables from a `client\.env` if it exists (useful when developing)
const envPath = path.resolve(__dirname, 'client', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = require('./backend/app/app');

require('./backend/app/cors');

// this needs to be added early so that headers are added to all subsequent responses
require('./backend/app/headers');

require('./backend/app/logging');

require('./backend/authenticatedRoutes/authenticatedRoutes');

require('./backend/dangerousOpenRoutes/dangerousOpenRoutes');

const port =  process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
