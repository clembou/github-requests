const fs = require('fs');
const config = require('../../config');
const https = require('https');
const url = require('url');
const request = require('request');

const authenticatedRouter = require('./authenticatedRouter');

const GITHUB_API_ROOT = 'https://api.github.com';

authenticatedRouter.get('/repos/:organisation/:repo/issues', function(req, res) {
  console.log('Request App received request to: ', req.url);

  if (!validateRepository(req.params.organisation, req.params.repo, config.appData.projects))
    res.status(403).send({ error: 'Invalid repository name' });

  console.log(`Request App: Listing issues on repository ${req.params.organisation}/${req.params.repo}`);

  const gitHubRequest = request(getProxyRequestOptions(req.url)); // add the authorization that github wants
  
  console.log('Request App: Proxying request to: ', getProxyRequestOptions(req.url).url);
  
  req
  .pipe(gitHubRequest, genericErrorHandler) // send to git hub
  .on('response', response => rewriteResponseHeaders(req, response)) // response from github, monkey with the headers for some reason. Looking at the logs it doesn't seem to do anything
  .pipe(res); // pipe response from github back to response from this route / function
});

// I don't think this is required.
// appOrRouter.get('/repositories/:repoId/issues', function(req, res) {
//   console.log(`going through pages on repository ${req.params.repoId}`);
//   const r = request(getProxyRequestOptions(req.url));
//   console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
//   req.pipe(r, genericErrorHandler).on('response', response => rewriteResponseHeaders(req, response)).pipe(res);
// });

authenticatedRouter.post('/repos/:organisation/:repo/issues', function(req, res) {
  if (!validateRepository(req.params.organisation, req.params.repo, config.appData.projects))
    res.status(403).send({ error: 'Invalid repository name' });

  console.log(`creating issue on repository ${req.params.organisation}/${req.params.repo}`);
  const r = request.post(getProxyRequestOptions(req.url));
  req.pipe(r, genericErrorHandler).pipe(res);
});



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

