const fs = require('fs');
const qs = require('qs');
const https = require('https');
const url = require('url');
const request = require('request');
const passport = require('passport');
const config = require('./config');
const bodyParser = require('body-parser');
const helper = require('sendgrid').mail;
const sg = require('sendgrid')(config.app.sendGridApiKey);
const requestUtils = require('./client/src/shared/requestUtils');
const notifications = require('./notifications');

module.exports = function(app) {
  const GITHUB_API_ROOT = 'https://api.github.com';

  const getlocalAppRootUrl = request => {
    return process.env.NODE_ENV == 'production'
      ? url.format({
          protocol: 'https', // request.protocol returns http for now since the node server itself is only using http. However the api is used over https thanks to azure / IIS
          host: request.hostname,
          // port: request.port,
          pathname: ''
        })
      : 'https://localhost:3000'; // hard coded value in development because the request came through the webpack dev server on a different port and via https.
  };

  function loadAppData() {
    return JSON.parse(fs.readFileSync(`${__dirname}/${config.app.groupConfigPath}`, 'utf-8'));
  }

  const appData = loadAppData();

  // Utility functions
  const sendMail = (to, title, body) => {
    const from_email = new helper.Email(config.app.emailSender);
    const to_email = new helper.Email(to);
    const subject = title;
    const content = new helper.Content('text/html', body);
    const mail = new helper.Mail(from_email, subject, to_email, content);

    const request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    return sg.API(request);
  };

  const getProxyRequestOptions = url => ({
    url: GITHUB_API_ROOT + url.replace('/api', ''),
    headers: {
      Authorization: `token ${config.github.botToken}`
    }
  });

  const rewriteResponseHeaders = (request, response) => {
    if (response.headers.link) {
      response.headers.link = response.headers.link.replace(GITHUB_API_ROOT, getlocalAppRootUrl(request) + '/api');
    }
  };

  const genericErrorHandler = (error, response, body) => {
    if (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('Refused connection');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out');
      } else {
        throw error;
      }
    }
  };

  const validateRepository = (organisation, repo, projects) => {
    if (projects.filter(p => p.organisation == organisation && p.repository == repo).length == 0) {
      console.log(`listing issues on repository ${req.params.organisation}/${req.params.repo}`);
      return false;
    }
    return true;
  };

  // App end points
  app.get('/api/projects', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    res.json(appData);
  });

  app.get('/api/authenticate/github/:code', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    const r = request.post(
      {
        url: 'https://github.com/login/oauth/access_token',
        json: {
          client_id: config.github.clientID,
          client_secret: config.github.clientSecret,
          code: req.params.code
        }
      },
      genericErrorHandler
    );
    r.pipe(res);
  });

  // proxy to github api end points
  app.get('/api/repos/:organisation/:repo/issues', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    const r = request(getProxyRequestOptions(req.url));
    console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
    req.pipe(r, genericErrorHandler).on('response', response => rewriteResponseHeaders(req, response)).pipe(res);
  });

  app.get('/api/repositories/:repoId/issues', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    console.log(`going through pages on repository ${req.params.repoId}`);
    const r = request(getProxyRequestOptions(req.url));
    console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
    req.pipe(r, genericErrorHandler).on('response', response => rewriteResponseHeaders(req, response)).pipe(res);
  });

  app.get('/api/repos/:organisation/:repo/issues/:issueId', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    const r = request(getProxyRequestOptions(req.url));
    console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.post('/api/repos/:organisation/:repo/issues', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    console.log(`creating issue on repository ${req.params.organisation}/${req.params.repo}`);
    const r = request.post(getProxyRequestOptions(req.url));
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.get('/api/repos/:organisation/:repo/issues/:issueId/comments', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    const r = request(getProxyRequestOptions(req.url));
    console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.post('/api/repos/:organisation/:repo/issues/:issueId/comments', passport.authenticate('oauth-bearer', { session: false }), function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    console.log(`adding comment on issue in repository ${req.params.organisation}/${req.params.repo}`);
    const r = request.post(getProxyRequestOptions(req.url));
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  // handle github web hooks
  app.post('/api/github-webhooks', [passport.authenticate('oauth-bearer', { session: false }), bodyParser.json()], function(req, res) {
    console.log(`received web hook: ${req.headers['x-github-event']}`);
    const eventType = req.headers['x-github-event'];
    if (
      eventType &&
      ['issues', 'issue_comment'].includes(eventType) &&
      req.body &&
      req.body.issue &&
      req.body.issue.user.login === config.github.botLogin
    ) {
      const { email } = requestUtils.getCreator(req.body.issue);

      try {
        const project = notifications.findProject(req.body, appData.projects);
        const requestUrl = notifications.getRequestUrl(req.body.issue.number, project, getlocalAppRootUrl(req));
        const { subject, content } = notifications.getNotificationText(eventType, req.body, project.name, requestUrl);

        if (email && subject && content) {
          sendMail(email, subject, content)
            .then(response => {
              console.log(response.statusCode, `Email notification sent successfully to ${email}`);
            })
            .catch(error => {
              //error is an instance of SendGridError
              //The full response is attached to error.response
              console.log(error.response);
            });
        }
      } catch (error) {
        console.log('An error occcured while attempting to process the following github webhook:');
        console.log(error);
        console.log('webhook data:');
        console.dir(req.body);
        res.json({
          message: 'An error occcured while attempting to process a github webhook',
          webhook: req.body
        });
      }
    }
    res.json({ message: 'web hook processed' });
  });
};
