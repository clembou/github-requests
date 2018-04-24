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

# Run

## From vscode

Press F5 in vscode and choose node. This will start the backend server (which can also serve the static front end files via static.js, but doesn't build them), and allows debugging.

## From console

`npm run debug`

The backend server and the front end dev server can be started in one command using node-foreman. Install node-foreman if needed (`npm i -g foreman`). procfile tells foreman what to do.

This has the benefit the nodemon will check for changes to the website and automatically restart the server if required. This definitely works for the backend api code, I haven't checked if it works for the front end code yet.

The front end server in this case serves the unbuilt source files, so is always up to date. In order to have the front end up to date with other methods, we would need to build the front end first.

## More esoteric

`npm start` will build the front end code and start the server. If this doesn't work, but `npm run debug` does, then there is a problem with the backend serving the frontend files.

To start the node back end server / api only (which can also serve the front end static files, but doesn't build them), run `npm run debug-server` at the repo root.

To start the front end dev-server only, run `cd client && npm start` at the repo root.

# Code

Cedd has made some [notes on some the code](cedd-code-notes.md).

# Deployment

It can be quite tricky setting everything up for a new deployment (eg creating a new App Service in azure, rather than releasing a new version to an existing one). Please see [Cedd's notes for details](new-deployment-notes.md)

Define all the above variables as application settings on your azure web app. 

## Deployment options

Azure's git deployment option (https://docs.microsoft.com/en-us/azure/app-service/app-service-deploy-local-git). Azure will automatically install the relevant npm dependencies, build the front end code, and start the node server. This might be a bit flaky though, and doesn't work for Cedd (the npm commands failed).

Zip Deploy. You can zip up the website, and go to the `Advanced Tools` of the App Service in Azure, and then click on `Tools - Zip push deploy`. Then drag the zip file on to the page. This can also be flaky with npm commands, but you can remove the npm commands from `deploy.cmd`, run them yourself locally and then zip and upload the results. This seems foolproof so far.

## Sending emails

If you want to enable email notifications, you will need to setup a web hook on github to send issue related events to the `api/github-webhooks` endpoint, and setup a valid sendgrid api key. 

You can use [ngrok](https://ngrok.com/) to debug this locally (ngrok gives you a publicly available url that you can put in to the github webhook, and then it forwards all the traffic to your local server, and its dead easy to use).
