# Deploying a new instance of GitHub to TEC Systems

## Plan

- Get it working locally, using the same settings as a current live deployment that works
- Get it working with the TEC Systems GitHub Organisation
- Create a new App Service and Enterprise Application in Azure and update the settings to use these, but still run locally
- Get in working in Azure
- Use the res-cloud domain
- Make sure that emailing works

## Get it working locally, using the same settings as a current live deployment that works

Fork repo to tec systems

Clone repo locally, npm install, install foreman, npm run debug.

Set everything in my .env file as it is in the smart azure deployment (from the App Service settings)

I now get this

AADSTS50011: The reply address 'http://localhost:3000/callback/azure' does not match the reply addresses configured for the application: '7036de4d-5087-445b-be01-898dafed9c25'. More details: not specified

This is semi expected, I need to set myself up as a callback url for the oauth flow.

We have to add the reply url. There must be a quicker way of finding this, but I couldn't find it.
- App Services
- res-guthub-requests
- Authentication / Authorization
- Click on Azure Active Diretory  authentication provider
- Click on Manage Application
- Settings
- reply Urls
- click save and wait a few seconds. Check the little bell icon in azure to see if it saved it ok.

Now I get this

Unhandled Rejection (Error): HTTP Error Internal Server Error
checkStatus
C:/Repos/GitHub/tec-systems-github-requests/client/src/shared/clientUtils.js:5

This seemed to happen for a while when getting my user details from azure, but then it stopped happening without me doing anything. I think 

I now get an error page, and if I look in the console where the  `npm run debug` is running, or in the network part of the browser dev tools, I see the following

Proxy error: Could not proxy request /api/projects from localhost:3000 to http://localhost:4000/ (ECONNREFUSED).

I ran the back end and front end server in different console windows, and set the https=true in the .env file and now I can see a list of projects. Boom!

I can click on a project and see a list of bugs. Now I want to connect it to the tec systems git hub organisation.

## Get it working with the TEC Systems GitHub Organisation

Create an OAuth app from GitHub organisation settings, set REACT_APP_GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env

Log in to GitHub as the tec-systems-bot account and create a personal access token. Set GITHUB_BOT_TOKEN in .env

Set REACT_APP_GITHUB_BOT_LOGIN in env to name of bot account. I'm not sure if this is necessary

Modify projects.json to contain the tec systems groups / repos that I want.

Create a GitHub webhook on the tec systems organisation, with issue and issue comments. I don't think it will work yet but its just for sending emails so can sort that out later. Set GITHUB_WEBHOOK_SECRET in .env

## Create a new App Service and Enterprise Application in Azure and update the settings to use these, but still run locally

Create a new app service in azure for the app. Turn Authentication / Authorization on. Allow anonymous requests. Configure Azure Active Directory. It asks me to create a new Enterprise Application and I let it. Click save, go out and back in again. Click Manage Application and set up all the reply urls that you will need. Copy from an existing one, but any deployment (including local, and http / https variations) will require one to work. I think both the front end and the back end need to have reply urls listed.

The app now stops working and I cant log in, this appears in the address bar / developer tools.

https://localhost:3000/callback/azure#error=unsupported_response_type&error_description=AADSTS70005%3a+response_type+%27token%27+is+not+enabled+for+the+application%0d%0aTrace+ID%3a+c54fd2df-14a7-4c73-b446-a15d1c755a00%0d%0aCorrelation+ID%3a+2d02a875-8bb8-48e5-803a-6eb156977396%0d%0aTimestamp%3a+2018-03-15+17%3a32%3a38Z&state=%2frequests

I try clicking the manifest and I make sure that the manifest json files are bascially the same. Still no luck. Although I made `"oauth2AllowImplicitFlow": true`, which I think is required.

The next morning I get a different error when doing the same thing. Maybe I got confused, or maybe the manifest change takes a while to work its way through a cache or something.

The new error is

https://localhost:3000/callback/azure#www.aadsts65005%3a+invalid+resource.+the+client+has+requested+access+to+a+resource+which+is+not+listed+in+the+requested+permissions+in+the+client's+application+registration ....

I then notice that there is a difference between Permissions and Required Permissions. The Enterprise App doesn't have any permissions, and I can't set any from the blade. If I get to the Enterprise App via the App Service, then I see almost the same blade, except that it is called "Required Permissions". If I click "Grant Permissions" on this, the permissions are actually set on the Enterprise Application. To get to the blade go the to App Service, then Authentication / Authorization, then click on the Azure Active Directory Authentication provider, make sure the Management mode is Express, Manage Application, Settings, Required Permissions. Phew!

And now it works locally, with the environment variables pointing to the newly created App Service / Enterprise Application.

## Get in working in Azure

Follow some instructions: https://docs.microsoft.com/en-us/azure/app-service/app-service-deploy-local-git

- Setup azure cloud shell
- Set up user for github deployments in cloud shell. Details in the software team password place.
- Configure app service for github deployments using cloud shell
- Add azure remote to repo `git remote add ....`
- `git push azure`

The `git push azure` didn't work, and gave lots of errors related to clems github account (github:clembou/github Host key verification failed). I update client\package.json to point at the official github repo instead of clems fork, but I still get the same problem.

