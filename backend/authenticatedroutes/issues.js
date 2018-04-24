const config = require('../../config');
const request = require('request');
const { getProxyRequestOptions, genericErrorHandler } = require( '../gitHubProxyHelpers');
const validateRepository = require( '../configHelpers');

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
  .pipe(res); // pipe response from github back to response from this route / function
});

authenticatedRouter.post('/repos/:organisation/:repo/issues', function(req, res) {
  if (!validateRepository(req.params.organisation, req.params.repo, config.appData.projects))
    res.status(403).send({ error: 'Invalid repository name' });

  console.log(`creating issue on repository ${req.params.organisation}/${req.params.repo}`);
  const r = request.post(getProxyRequestOptions(req.url));
  req.pipe(r, genericErrorHandler).pipe(res);
});

