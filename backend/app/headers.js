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
