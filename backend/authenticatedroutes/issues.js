const config = require('../../config');
// const https = require('https');
// const url = require('url');
const request = require('request');
const { validateRepository, getProxyRequestOptions, genericErrorHandler } = require( './gitHubProxyHelpers');


const authenticatedRouter = require('./authenticatedRouter');

authenticatedRouter.get('/repos/:organisation/:repo/issues', function(req, res) {
  console.log('Request App received request to: ', req.url);

  if (!validateRepository(req.params.organisation, req.params.repo, config.appData.projects))
    res.status(403).send({ error: 'Invalid repository name' });

  console.log(`Request App: Listing issues on repository ${req.params.organisation}/${req.params.repo}`);

  const gitHubRequest = request(getProxyRequestOptions(req.url)); // add the authorization that github wants
  
  console.log('Request App: Proxying request to: ', getProxyRequestOptions(req.url).url);
  
  req
  .pipe(gitHubRequest, genericErrorHandler) // send to git hub
  //.on('response', response => rewriteResponseHeaders(req, response)) // response from github, monkey with the headers for some reason. Looking at the logs it doesn't seem to do anything
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

