'use strict';

const app = require('./app');

// remove the automatically added `X-Powered-By` header
app.disable('x-powered-by');

require('./api.js')(app);
require('./static.js')(app);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
