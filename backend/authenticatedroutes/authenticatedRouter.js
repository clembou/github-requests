'use strict';
const express = require('express');
const app = require('../../app');

//module.exports = function(appOrRouter) {
  console.log(`authenticatedRouter`)
  const router = express.Router();
  const authentication = require('../middleware/authentication')(router);
  router.use(authentication);

  //require('./projects.js');
  //require('./api.js')(router);
//};
  //app.use('/api', router);

module.exports = router;