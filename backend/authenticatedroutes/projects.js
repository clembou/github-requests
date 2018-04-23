const fs = require('fs');
const config = require('../../config');

module.exports = function(appOrRouter) {
  function loadAppData() {
    return JSON.parse(fs.readFileSync(`${__dirname}/../../${config.app.groupConfigPath}`, 'utf-8'));
  }

  const appData = loadAppData();

  appOrRouter.get('/projects', function(req, res) {
    res.json(appData);
  });

};
