'use strict';

const app = require('./app');
require('./api.js')(app);
require('./static.js')(app);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
