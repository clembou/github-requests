// Please visit http://go.microsoft.com/fwlink/?LinkID=761099&clcid=0x409 for more information on settting up Github Webhooks
var request = require('request');

module.exports = function (context, data) {

    // do nothing if the incoming data is empty
    if (!data) {
        context.done();
        return;
    }

    const REQUESTS_APP_WEBHOOKS_ENDPOINT = process.env['REQUESTS_APP_WEBHOOKS_ENDPOINT'];
    if (!REQUESTS_APP_WEBHOOKS_ENDPOINT || REQUESTS_APP_WEBHOOKS_ENDPOINT.length < 1) {
        context.done(`'REQUESTS_APP_WEBHOOKS_ENDPOINT' is either missing or empty`);
        return;
    }

    const AAD_TENANT_GUID = process.env['REACT_APP_TENANT_ID'];
    if (!AAD_TENANT_GUID || AAD_TENANT_GUID.length < 1) {
        context.done(`'AAD_TENANT_GUID' is either missing or empty`);
        return;
    }

    const AAD_REQUESTS_APP_CLIENT_ID = process.env['REACT_APP_CLIENT_ID'];
    if (!AAD_REQUESTS_APP_CLIENT_ID || AAD_REQUESTS_APP_CLIENT_ID.length < 1) {
        context.done(`'AAD_REQUESTS_APP_CLIENT_ID' is either missing or empty`);
        return;
    }

    const AAD_REQUESTS_APP_CLIENT_SECRET = process.env['REQUESTS_APP_CLIENT_SECRET'];
    if (!AAD_REQUESTS_APP_CLIENT_SECRET || AAD_REQUESTS_APP_CLIENT_SECRET.length < 1) {
        context.done(`'REQUESTS_APP_CLIENT_SECRET' is either missing or empty`);
        return;
    }

    const GITHUB_EVENTS_TO_WATCH = (process.env['GITHUB_EVENTS_TO_WATCH'] || '').split(';');
    if (!GITHUB_EVENTS_TO_WATCH || GITHUB_EVENTS_TO_WATCH.length < 1) {
        context.done();
        return;
    }

    const GITHUB_LOGINS_TO_WATCH = (process.env['REACT_APP_GITHUB_BOT_LOGIN'] || '').split(';');
    if (!GITHUB_LOGINS_TO_WATCH || GITHUB_LOGINS_TO_WATCH.length < 1) {
        context.done();
        return;
    }

    // only watch specific GitHub events
    // see https://developer.github.com/webhooks/#events
    const gitHubEvent = context.req.headers['x-github-event'] || context.req.headers['X-GitHub-Event'];
    if (!gitHubEvent || GITHUB_EVENTS_TO_WATCH.indexOf(gitHubEvent) < 0) {
        context.done();
        return;
    }

    // only watch specific GitHub logins
    const issueCreatorLogin = data.issue.user.login;
    if (!issueCreatorLogin || GITHUB_LOGINS_TO_WATCH.indexOf(issueCreatorLogin) < 0) {
        context.done();
        return;
    }

    const gitHubDelivery = context.req.headers['x-github-delivery'] || context.req.headers['X-GitHub-Delivery'];

    context.log(gitHubEvent, issueCreatorLogin, gitHubDelivery);

    request.post(
        {
            url: `https://login.windows.net/${AAD_TENANT_GUID}/oauth2/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            },
            formData: {
                'grant_type': 'client_credentials',
                'client_id': AAD_REQUESTS_APP_CLIENT_ID,
                'client_secret': AAD_REQUESTS_APP_CLIENT_SECRET,
                'resource': AAD_REQUESTS_APP_CLIENT_ID
            },
            timeout: 2000
        },
        function (error, response, body) {
            if (error) {
                context.log('failed to get authorization token:', error);
                context.done(error);
            }
            else {
                const tokenResponse = JSON.parse(body);

                request.post({
                    url: REQUESTS_APP_WEBHOOKS_ENDPOINT,
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'X-GitHub-Event': gitHubEvent
                    },
                    auth: {
                        bearer: tokenResponse.access_token,
                        sendImmediately: true
                    },
                    json: data,
                    timeout: 2000
                });

                context.done();
            }
        }
    );
};