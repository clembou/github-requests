const request = require('request');
const config = require('../../config');
const { getProxyRequestOptions, genericErrorHandler } = require( '../gitHubProxyHelpers');
const validateRepository = require( '../configHelpers');

const authenticatedRouter = require('./authenticatedRouter');

authenticatedRouter.get('/repos/:organisation/:repo/issues/:issueId/comments', function(req, res) {
  if (!validateRepository(req.params.organisation, req.params.repo, config.appData.projects))
    res.status(403).send({ error: 'Invalid repository name' });

  const r = request(getProxyRequestOptions(req.url));
  console.log('Proxied request to: ', getProxyRequestOptions(req.url).url);
  req.pipe(r, genericErrorHandler).pipe(res);
});

authenticatedRouter.post('/repos/:organisation/:repo/issues/:issueId/comments', function(req, res) {
  if (!validateRepository(req.params.organisation, req.params.repo, config.appData.projects))
    res.status(403).send({ error: 'Invalid repository name' });

  console.log(`adding comment on issue in repository ${req.params.organisation}/${req.params.repo}`);
  const r = request.post(getProxyRequestOptions(req.url));
  req.pipe(r, genericErrorHandler).pipe(res);
});

