'use strict';
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, 'client', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = require('./app');

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

require('./api.js')(app);
require('./static.js')(app);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
