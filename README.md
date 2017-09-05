# Github Requests
This project's goal is to enable teams to collect user feedback and organise work via github issues across multiple repositories.

It enables non github members to raise issues via a bot account, and github members to aggregates and track issues across different repositories.

# Setup
## Create Oauth applications in Azure and Github
The app uses Azure Active Directory to authenticate users, and unlocks more functionalities for administators with a github account.
To enable this, you need to create  OAuth applications on Azure and Github, and pass the relevant parameters to the app (see below).

## Configure development environment
to run this application, you need to provide secrets and constants as environment variables. An easy way to do this during development is to do it via a [`.env`](https://www.npmjs.com/package/dotenv) file. You will need to create the file in `./client/.env`.

in production, you will need to setup the environment variables before building and starting the application.

See below for an example `.env` file containing the definition for all the variables needed by both the front end and back end code:
```
# Variables used by both back end and front end code
REACT_APP_TENANT_ID=*your azure tenant id*
REACT_APP_CLIENT_ID=*the azure ad client id for your app*
REACT_APP_GITHUB_CLIENT_ID=*github client id for your app*
# Backend only
GITHUB_CLIENT_SECRET=*github client secret for your app*
GITHUB_BOT_TOKEN=*bot account token with the 'repo' scope and allowed to access the configured repositories*
IDENTITY_METADATA=https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
GROUP_CONFIG_PATH='projects.json' *path to project configuration file. This should live in an folder ignored by git or out of the github repository used by azure deployments*
SENDGRID_API_KEY=*your sendgrid api key*
SENDGRID_EMAIL_SENDER='example@somedomain.com'
# Front end only
REACT_APP_ADMIN_GROUP_ID=*guid of Azure AD groups containing admins. use semicolon delimiter to list multiple groups*
REACT_APP_GITHUB_BOT_LOGIN=*name of the bot account used to proxy requests*
REACT_APP_DOMAIN_HINT= *your-domain.com - if known in advance, specifying this environment variable will ensure the Azure log in page automatically select the correct account if a user is logged in in multiple directories*
# Optional, leave undefined to use the default stylesheets
REACT_APP_BOOTSTRAP_CSS_PATH='./app_data/bootstrap.css'
REACT_APP_APPLICATION_STYLES_PATH='./app_data/index.css'
# Front end in development only
HTTPS=true
```

# Install
run `npm install` to install the required back end and front end dependencies.

# Start
`npm start` will build the front end code and start the server.

During development, the backend server and the front end dev server can be started in one command using node-foreman.

Install node-foreman if needed (`npm i -g foreman`), then run `npm run debug`.

To start the node server only, run `npm run debug-server` at the repo root.
To start the front end dev-server only, run `cd client && npm start` at the repo root.

# Deployment
Define all the above variables as application settings on your azure web app. Then, you can deploy new versions of the app using azure's git deployment option for example. Azure will automatically install the relevant npm dependencies, build the front end code, and start the node server.

**Note**: deployments are currently relatively slow, especially the first time since the `npm install` step needs to fetch all the packages. This is a known issue.

If you want to enable email notifications, you will need to setup a web hook on github to send issue related events to the 
`api/github-webhooks` endpoint, and a valid sendgrid api key.
