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

AADSTS50011: The reply address 'http://localhost:3000/callback/azure' does not match the reply addresses configured for the application: ''. More details: not specified

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

https://localhost:3000/callback/azure#error=unsupported_response_type&error_description=AADSTS70005%3a+response_type+%27token%27+is+not+enabled+for+the+application ...

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
- Configure App Service for github deployments using cloud shell
- Add azure remote to repo `git remote add ....`
- `git push azure`

The `git push azure` didn't work, and gave lots of errors related to clems github account (github:clembou/github Host key verification failed). 

This is because of this line in client\package.json, which looks dodgy, but if I replace it with something better the app stops working locally, and still doesn't deploy to azure.
    "github-api": "github:clembou/github",

I think azure detects node and just calls npm start. This builds the front end code, which is then served by the backend server (when built, the front end stuff is all static). The front end stuff then calls the server, by using the proxy in client\package.json. Npm start starts the server with `node server.js`.

I try just uploading a zip file with all the npm install type commands already run. I then remove these commands from deploy.cmd and upload to azure. The ZipDeploy page is as https://tec-systems-issue-tracker.scm.azurewebsites.net/zipdeploy. You can just drag a zip file in to the file view bit.

This works. woot!

## Use the res-cloud domain

Went in to App Service and set up a Custom Domain for res-cloud (by clicking on Add Hostname in Custom Domains blade). This allows you to go the an http (eg unsecured) version of the site at the res-cloud domain. Because it is unsecured it won't work.

Set up a certificate for the domain (SSL Certificates blade under App Service). There already was a certificate listed in Private Certificates bit, but when I click on Add Binding it fails with a permission error. This is because the certificate has to be in the same resource group as the app service. This is very hard to find out, and the error message isn't helpful. So even though it lists a certificate, its not possible to use it.

To sort this out need to export the certificate from the res-cloud resource group and then import it in to the App Service (in tec-systems resource group). Follow this article to do so https://blogs.msdn.microsoft.com/appserviceteam/2017/02/24/creating-a-local-pfx-copy-of-app-service-certificate/

After importing the certificate, nothing really changes, and when I click on Add Binding there is no hostname to choose. If I wait a while (30 mins or so) then it works. Use "SNI SSL" SSL type.

This allowed me to see the website in https, at the custom domain.

However at this point the website stopped being able to talk to GitHub properly, and so no longer works. It remains to no longer work if I go to the azurewebsites.net domain. I delete the domain name and ssl changes that I've made, and the website still doesn't work. hmmmm.

## Making it work again 

Set up the log stream in azure, add some more logging to the app , redeploy and see what is going on.

This was fixed by changing the 'accept-encoding' header when proxying the GitHub api. The Request app client sends all requests for issues and suchlike to the request app backend. The back end then modifies the url and authorization and sends it on to the GitHub api. I think this is done to keep the client code simple, and using a standard method of authorisation (GitHub uses a slightly non standard oauth, with an "Authorization: "token: ..."' header, whereas the standard uses `Bearer` in place of `token`. When doing this proxying, it seems that the response was being compressed in a way that wasn't working. I don't know the details of this, but changing the 'accept-encoding' header to 'identity' corrects the problem. Identity means don't do any compression, so it will make the data transfer slower. Interesting this worked locally but didn't work on Azure. I made sure that the node and npm versions were similar on azure and locally, so its a mystery to me why it doesn't work.

The node version on the Azure AppService is meant to match that in packages.config, but that doesn't seem to work. Instead you can set the `WEBSITE_NODE_DEFAULT_VERSION` in the Application settings in the Azure portal and restart the app. Azure will use an npm version to match the node version.

## Making it work again again

Whilst I was working on the emails, it mysteriously stopped working again.

The request app logs were showing a permission error, although the personal access token from the tec-systems-bot was definitely correct. I logged in as the bot and it was showing a warning about an unverified email address, so I sorted that out by using cedd.burge@res-group.com as the primary email address and verifying it when the email arrived. It seems that tecsystemssupport@res-group.com is not available external to res, so I couldn't use that. We should probably set up a new email account for the bot.

## Emails

I added the function app, but it doesn't seem to get called by anything. I'm going to try and turn it off later and see if anything happens.

I add some logging to the app.

It can't process the body of the request, so I go the the github webhook and change it to json encoding.

It can't match the config.github.botLogin with the username from the issue, even though they look the same to me.

I install ngrok (https://ngrok.com/) in order to debug the webhook locally. NGrok is excellent.

With some more logging I find out that the emailing tries to match a project with the github issue, and part of the matching requires that the issue have a `label` that matches the `label` property from the projects.json file. This is a problem because the front end code seems to rely on the label property being the same as the repository name. Both these uses of label look like a bad idea. Removing it from the front end code looks like a big job. So I just remove it from the back end code for now.

I then find out 