'use strict';
const express = require('express');

module.exports = function(appOrRouter) {
  const router = express.Router();
  const authentication = require('../middleware/authentication')(router);
  router.use(authentication);

  require('./projects.js')(router);
  require('./api.js')(router);
  appOrRouter.use('/api', router);
};