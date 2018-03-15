Setting up git hub requests

clone repo to tec systems

created app service

setup azure cloud shell

set up user for github deployments in cloud shell

configure app service for github deployments using cloud shell

clone repo locally, npm install, install foreman, npm run debug.

use the .env file from the smart repo (ins't  latest one)

It runs, but the following error happens when I try to log in

Selected user account does not exist in tenant 'RES Cloud Directory' and cannot access the application '8a18d7cb-8fd1-41af-bcbd-ba68b3b687d7' in that tenant. The account needs to be added as an external user in the tenant first. Please use a different account. These are old details so this is fine, I need to update the .env file.

I add some comments to the .env file for what each thing means and where you can find the correct 

I also set everything in my .env file as it is in the smart azure deployment, I now get this

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