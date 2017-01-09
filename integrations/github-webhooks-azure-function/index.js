// Please visit http://go.microsoft.com/fwlink/?LinkID=761099&clcid=0x409 for more information on settting up Github Webhooks
var request = require('request');

module.exports = function (context, data) {

    const REQUESTS_APP_WEBHOOKS_ENDPOINT = process.env['REQUESTS_APP_WEBHOOKS_ENDPOINT'];
    const AAD_TENANT_GUID = process.env['REACT_APP_TENANT_ID'];
    const AAD_REQUESTS_APP_CLIENT_ID = process.env['REACT_APP_CLIENT_ID'];
    const AAD_REQUESTS_APP_CLIENT_SECRET = process.env['REQUESTS_APP_CLIENT_SECRET'];

    // do nothing if required config settings are missing
    if (!REQUESTS_APP_WEBHOOKS_ENDPOINT || !AAD_TENANT_GUID || !AAD_REQUESTS_APP_CLIENT_ID || !AAD_REQUESTS_APP_CLIENT_SECRET) {
        context.done();
        return;
    }

    const GITHUB_EVENTS_TO_WATCH = (process.env['GITHUB_EVENTS_TO_WATCH'] || '').split(';');
    const GITHUB_LOGINS_TO_WATCH = (process.env['REACT_APP_GITHUB_BOT_LOGIN'] || '').split(';');

    // do nothing if there's nothing to watch
    if (!GITHUB_EVENTS_TO_WATCH || !GITHUB_LOGINS_TO_WATCH || GITHUB_EVENTS_TO_WATCH.length < 1 || GITHUB_LOGINS_TO_WATCH.length < 1) {
        context.done();
        return;
    }

    // do nothing if the incoming data is empty
    if (!context.req || !data) {
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