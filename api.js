const fs = require('fs');
const qs = require('qs');
const https = require('https');
const url = require('url');
const request = require('request');
//const passport = require('passport');
const config = require('./config');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const requestUtils = require('./client/src/shared/requestUtils');
const notifications = require('./notifications');
const crypto = require('crypto');
const compare = require('secure-compare');

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
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: to,
      from: config.app.emailSender,
      subject: title,
      html: body,
    };
    return sgMail.send(msg);
  };

  const getProxyRequestOptions = url => ({
    url: GITHUB_API_ROOT + url.replace('/api', ''),
    headers: {
      Authorization: `token ${config.github.botToken}`
      //,"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
      ,"accept-encoding": "identity",
    }
  });

  const rewriteResponseHeaders = (request, response) => {
    if (response.headers.link) {
      response.headers.link = response.headers.link.replace(GITHUB_API_ROOT, getlocalAppRootUrl(request) + '/api');
      console.log(`Request App: Rewritten response.headers.link: ${JSON.stringify(response.headers.link)}`);
    } else {
      console.log(`Request App: response.headers.link falsy, nothing to rewrite`);
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
      console.error(`Request App: Repository not found : ${organisation}/${repo}`);
      return false;
    } else {
      console.log(`Request App: Valid repository: ${organisation}/${repo}`);
      return true;
    }
  };

  // App end points
  app.get('/api/projects', /*passport.authenticate('oauth-bearer', { session: false }), */ function(req, res) {
    res.json(appData);
  });

  app.get('/api/authenticate/github/:code', /* passport.authenticate('oauth-bearer', { session: false }), */ function(req, res) {
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
  app.get('/api/repos/:organisation/:repo/issues', /*passport.authenticate('oauth-bearer', { session: false }), */function(req, res) {
    console.log('Request App received request to: ', req.url);

    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    console.log(`Request App: Listing issues on repository ${req.params.organisation}/${req.params.repo}`);

    const gitHubRequest = request(getProxyRequestOptions(req.url)); // add the authorization that github wants
    
    console.log('Request App: Proxying request to: ', getProxyRequestOptions(req.url).url);
    
    req
    .pipe(gitHubRequest, genericErrorHandler) // send to git hub
    .on('response', response => rewriteResponseHeaders(req, response)) // response from github, monkey with the headers for some reason. Looking at the logs it doesn't seem to do anything
    .pipe(res); // pipe response from github back to response from this route / function
  });

  app.get('/api/repositories/:repoId/issues', /* passport.authenticate('oauth-bearer', { session: false }), */ function(req, res) {
    console.log(`going through pages on repository ${req.params.repoId}`);
    const r = request(getProxyRequestOptions(req.url));
    console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
    req.pipe(r, genericErrorHandler).on('response', response => rewriteResponseHeaders(req, response)).pipe(res);
  });

  app.get('/api/repos/:organisation/:repo/issues/:issueId', /* passport.authenticate('oauth-bearer', { session: false }), */ function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    const r = request(getProxyRequestOptions(req.url));
    console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.post('/api/repos/:organisation/:repo/issues', /* passport.authenticate('oauth-bearer', { session: false }), */ function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    console.log(`creating issue on repository ${req.params.organisation}/${req.params.repo}`);
    const r = request.post(getProxyRequestOptions(req.url));
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.get('/api/repos/:organisation/:repo/issues/:issueId/comments', /* passport.authenticate('oauth-bearer', { session: false }), */ function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    const r = request(getProxyRequestOptions(req.url));
    console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  app.post('/api/repos/:organisation/:repo/issues/:issueId/comments', /* passport.authenticate('oauth-bearer', { session: false }), */ function(req, res) {
    if (!validateRepository(req.params.organisation, req.params.repo, appData.projects))
      res.status(403).send({ error: 'Invalid repository name' });

    console.log(`adding comment on issue in repository ${req.params.organisation}/${req.params.repo}`);
    const r = request.post(getProxyRequestOptions(req.url));
    req.pipe(r, genericErrorHandler).pipe(res);
  });

  // Calculate the X-Hub-Signature header value.
  function getSignature(buf) {
    var hmac = crypto.createHmac("sha1", config.github.webHookSecret);
    hmac.update(buf, "utf-8");
    return "sha1=" + hmac.digest("hex");
  }

  // Verify function compatible with body-parser to retrieve the request payload.
  // Read more: https://github.com/expressjs/body-parser#verify
  function verifyRequest(req, res, buf, encoding) {
    var expected = req.headers['x-hub-signature'];
    var calculated = getSignature(buf);
    console.log("X-Hub-Signature:", expected, "Content:", "-" + buf.toString('utf8') + "-");
    if (!compare(expected,calculated)) {
      throw new Error("Invalid signature.");
    } else {
      console.log("Valid signature!");
    }
  }

  function userLoginFromGitHubRequestBody(body){
    return (body && body.issue.user) ? body.issue.user.login : "";
  }

  function isGitHubWebHookRequestValid(req)  {
    return ['issues', 'issue_comment'].includes(req.headers['x-github-event']) && userLoginFromGitHubRequestBody(req.body) === config.github.botLogin;
  }

  function handleInvalidGitHubWebHookRequest(req, res)  {
    console.log('RequestApp: The following github webhook was not valid:');
    console.log(req.headers['x-github-event']);
    console.log(config.github.botLogin);
    console.log(userLoginFromGitHubRequestBody(req.body));
    
    res.status(422).send({
      message: 'The github webhook request is not valid'
    });
  }


  function sendEmailsForGitHubWebHook(req, res)  {
    try {
      trySendEmailsForGitHubWebHook(req, res);
    } catch (error) {
      handleErrorForEmailsForGitHubWebHook(req, res, error);
    }
  }
    
  function trySendEmailsForGitHubWebHook(req, res)  {
    const { email } = requestUtils.getCreator(req.body.issue);
    const project = notifications.findProject(req.body, appData.projects);
    const requestUrl = notifications.getRequestUrl(req.body.issue.number, project, getlocalAppRootUrl(req));
    const eventType = req.headers['x-github-event'];
    const { subject, content } = notifications.getNotificationText(eventType, req.body, project.name, requestUrl);

    console.log(`Request app: Email notification starting`);

    if (email && subject && content) {
      sendMail(email, subject, content)
        .then(response => {
          console.log(`Request app: Email notification sent successfully to ${email}`);
        })
        .catch(error => {
          //error is an instance of SendGridError
          //The full response is attached to error.response
          console.log(error.response);
        });
    }

    console.log(`Request app: Email notification returning response`);
    res.json({ message: 'web hook processed' });
  }
    
  function handleErrorForEmailsForGitHubWebHook(req, res, error)  {
    console.log('RequestApp: An error occcured while attempting to process the following github webhook:');
    console.log(error);

    res.status(500).json({
      message: 'An error occcured while attempting to process a github webhook',
    });
  }

  // handle github web hooks
  app.post('/api/github-webhooks', [bodyParser.json({verify:verifyRequest})], function(req, res) {

    // this message is unsecured because github doesn't have a token to call us
    // instead we check that this message was generated by our github instance
    // by checking that the signature of the body was created with the correct secret
    console.log(`RequestApp: received web hook action: ${req.headers['x-github-event']}`);
    console.log(JSON.stringify(req.headers));
    console.log(JSON.stringify(req.body));

    //const valid = isGitHubWebHookRequestValid(req);
    console.log(isGitHubWebHookRequestValid(req));

    if (isGitHubWebHookRequestValid(req)) {
      sendEmailsForGitHubWebHook(req, res)
    } else {
      handleInvalidGitHubWebHookRequest(req, res);
    }
  });
};
