const fs = require('fs');
const qs = require('qs');
const https = require('https');
const url = require('url');
const request = require('request');
const passport = require('passport');
const config = require('./config');

module.exports = function (app) {

  const GITHUB_API_ROOT = 'https://api.github.com';

  function loadProjects() {
    return JSON.parse(fs.readFileSync(`${__dirname}/${config.app.groupConfigPath}`, 'utf-8'));
  }

  const projects = loadProjects();

  const getProxyRequestOptions = url => (
    {
      url: GITHUB_API_ROOT + url.replace('/api', ''),
      headers: {
        'Authorization': `token ${config.github.botToken}`
      }
    }
  );

  const rewriteResponseHeaders = (request, response) => {
    if (response.headers.link) {
      const localApiRootUrl = process.env.NODE_ENV == 'production' ? url.format({
        protocol: 'https', // request.protocol returns http for now since the node server itself is only using http. However the api is used over https thanks to azure / IIS
        host: request.hostname,
        port: request.port,
        pathname: '/api'
      }) : 'https://localhost:3000/api'; // hard coded value in development because the request came through the webpack dev server on a different port and via https.

      response.headers.link = response.headers.link.replace(GITHUB_API_ROOT, localApiRootUrl)
    }
  }

  const genericErrorHandler = (error, response, body) => {
    if (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('Refused connection');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out');
      }
      else {
        throw error;
      }
    }
  };

  app.get('/api/projects', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    res.json(projects)
  })

  app.get('/api/authenticate/github/:code', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
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
  app.get('/api/repos/:organisation/:repo/issues', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    console.log(`listing issues on repository ${req.params.organisation}/${req.params.repo}`);
    const r = request(getProxyRequestOptions(req.url))
    console.log('Proxied request options: ', getProxyRequestOptions(req.url))
    req.pipe(r, genericErrorHandler)
      .on('response', response => rewriteResponseHeaders(req, response))
      .pipe(res);
  });

  app.get('/api/repositories/:repoId/issues', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    console.log(`going through pages on repository ${req.params.repoId}`);
    const r = request(getProxyRequestOptions(req.url))
    console.log('Proxied request options: ', getProxyRequestOptions(req.url))
    req.pipe(r, genericErrorHandler)
      .on('response', response => rewriteResponseHeaders(req, response))
      .pipe(res);
  });

  app.get('/api/repos/:organisation/:repo/issues/:issueId', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    const r = request(getProxyRequestOptions(req.url))
    console.log('Proxied request options: ', getProxyRequestOptions(req.url))
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.post('/api/repos/:organisation/:repo/issues', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    console.log(`creating issue on repository ${req.params.organisation}/${req.params.repo}`);

    proxyRequestOptions = getProxyRequestOptions(req.url)
    proxyRequestOptions.json = req.body

    const r = request.post(proxyRequestOptions)
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  // handle github web hooks
  app.post('/api/github-webhooks', passport.authenticate('oauth-bearer', { session: false }), function (req, res) {
    console.log(`received web hook:\n${req.body}`);
    res.json({ message: 'received web hook' });
  });
}
