const fs = require('fs');
const qs = require('qs');
const https = require('https');
const request = require('request');
const passport = require('passport');
const config = require('./config');

module.exports = function (app) {

  function loadProjects() {
    return JSON.parse(fs.readFileSync(`${__dirname}/${config.app.groupConfigPath}`, 'utf-8'));
  }

  const projects = loadProjects();

  const getProxyRequestOptions = url => (
    {
      url: 'https://api.github.com' + url.replace('/api', ''),
      headers: {
        'Authorization': `token ${config.github.botToken}`
      }
    }
  );


  const genericErrorHandler = (error, response, body) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out');
    }
    else {
      throw error;
    }
  };

  app.get('/api/projects', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    res.json({ groups: projects.groups })
  })

  app.get('/api/authenticate/github/:code', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    console.log('authenticating code:' + req.params.code);

    const r = request.post({
      url: 'https://github.com/login/oauth/access_token',
      json: {
        client_id: config.github.clientID,
        client_secret: config.github.clientSecret,
        code: req.params.code
      }
    }, genericErrorHandler)
    r.pipe(res);
  });

  // proxy to github api end points
  app.get('/api/repos/:orgName/:repoName/issues', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    console.log(`listing issues on repository ${req.params.orgName}/${req.params.repoName}`);
    const r = request(getProxyRequestOptions(req.url))
    console.log('Proxied request options: ', getProxyRequestOptions(req.url))
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.get('/api/repos/:orgName/:repoName/issues/:issueId', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    const r = request(getProxyRequestOptions(req.url))
    console.log('Proxied request options: ', getProxyRequestOptions(req.url))
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.post('/api/repos/:orgName/:repoName/issues', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    console.log(`creating issue on repository ${req.params.org}/${req.params.repo}`);

    proxyRequestOptions = getProxyRequestOptions(req.url)
    proxyRequestOptions.json = req.body

    const r = request.post(proxyRequestOptions)
    req.pipe(r, genericErrorHandler).pipe(res);
  });
}
