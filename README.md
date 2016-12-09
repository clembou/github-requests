# Github Requests
This project's goal is to enable teams to collect user feedback and organise work via github issues across multiple repositories.

It enables non github members to raise issues via a bot account, and github members to aggregates and track issues across different repositories.

# Setup
to run this application, you need to provide secrets and constants as environment variables.

An easy way to do this during development is to do it via an `.env` file.

See below for an example `.env` file containing the definition for all the variables needed by both the front end and back end code:
```
# Variables used by both back end and front end code
REACT_APP_TENANT_ID=*some value*
REACT_APP_CLIENT_ID=*some value*
REACT_APP_GITHUB_CLIENT_ID=*some value*
# Backend only
GITHUB_CLIENT_SECRET=*some value*
GITHUB_BOT_TOKEN=*bot account token with the 'repo' scope and allowed to access the configured repositories*
IDENTITY_METADATA=https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
# Front end only
REACT_APP_ADMIN_GROUP_ID=*guid of Azure AD group containing admins*
REACT_APP_GITHUB_BOT_LOGIN=*name of the bot account used to proxy requests*
REACT_APP_DOMAIN_HINT= *your-domain.com - if known in advance, specifying this environment variable will ensure the Azure log in page automatically select the correct account if a user is logged in in multiple directories*
# Front end in development only
HTTPS=true
```

in production, you need to setup the environment variables before building and starting the application.

For the time being, you will need to copy your .env file to `client/.env` manually before starting the development server, since the front end code expect to see its own .env file.

# Install
run `npm install` to install the required back end and front end dependencies.

# Start
`npm start` will build the front end code and start the server.

During development, the backend server and the front end dev server can be started in one command using node-foreman.

Install node-foreman if needed (`npm i -g node-foreman`), then run `npm run debug`.

To start the node server only, run `npm run debug-server` at the repo root.
To start the front end dev-server only, run `cd client && npm start` at the repo root.


