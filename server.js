'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');

// set up environment variables from a `client\.env` if it exists (useful when developing)
const envPath = path.resolve(__dirname, 'client', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = require('./app');

require('./backend/authenticatedRoutes/authenticatedRoutes.js');

// setup unauthenticated access routes
//const router2 = express.Router(); // does express.router return a singleton?
//require('./githubWebhook.js')(router2); 
//app.use('/webhook', router2);


// setup unauthenticated static routes.
// These have to be unauthenticated so that it is possible to show the user a sign in page, so that they can become authenticated
// this matches all routes so needs to come last
require('./backend/dangerousOpenRoutes/dangerousOpenRoutes');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
