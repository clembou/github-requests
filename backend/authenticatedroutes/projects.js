const fs = require('fs');
const config = require('../../config');

const authenticatedRouter = require('./authenticatedRouter');

authenticatedRouter.get('/projects', function(req, res) {
  res.json(config.appData);
});
