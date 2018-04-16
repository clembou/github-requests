# api.js

It's too long
 - git hub web hook to be in its own file / class
 - can use modules as per polys's repo. 
  - https://github.com/resgroup/energy-storage-system-sizing-tool/blob/master/backend/simulations/server.js
  - https://github.com/resgroup/energy-storage-system-sizing-tool/blob/master/backend/simulations/routes/cells.js
 - or probably slightly better technique as used by the mean stack, which keeps intellisense in each module
  - https://github.com/linnovate/mean/blob/master/server/routes/index.route.js (keeps intellisense)
 
Logging
- Polys thinks best to check to see if Morgan can do what I want, which it probably can
- Could copy polys plan and add in some middleware
 - https://github.com/resgroup/energy-storage-system-sizing-tool/blob/master/backend/simulations/middleware/logging.js

genericErrorHandler swallow / logs some errors 
- change name to something better
- want to indicate why some errors are ignored

Standard plan for what to return for errors
- return very little in the response, log error details to the logging thing
- document this in readme or architecture decision record

label in projects.json is used by front and back end in different and conflicting ways.
- It must be a label on the bug (eg "user request") in order to send an email in response to a new comment
- It must be the name of th repo in order to match a project on the front end
- neither of these is useful, we should remove it from both places and then delete it from projects.json
- I have removed it from the backend, removing it from the front end looks like a bigger job.

Delete azure function? It doesn't seem to do anything
- Yes do it
- This is here because clem was scared that he would leave an endpoint unauthenticated by mistake, but this seems like a bad reason to do something. So the entire app used the azure wrapper authentication, the azure function was unathenticated (but could only do one thing), and it authenticated using client id and secret.
- The app should have authentication for all endpoints except the github webhook endpoint, which can't authenticate (but checks the github webhook secret instead)

Use polys plan for authentication
- Saves repeating (and possibly forgetting) the auth for every endpoint.
- Have a module which adds all authenticated routes / middleware/logging
- Have a module which adds all unauthenticates routes (I think just the github web hook) 

Use Sentry for exceptions

validateRepository
- rename to isValidRepository

rewriteResponseHeaders
 - probably remove, looking at the logs its not doing anything
 - if keeping name it after what it does (maybe setLinkToOurApiInsteadOfGitHubApi)

getProxyRequestOptions
 - rename to gitHubRequestOptions

 
## How debug locally (breakpoints and that)

Can just press f5 in visual studio and then choose node.js. I think there is a way to make this the default as well.
This runs the backend, but actually the front end is just static, and the backend can also serve this (via static.js).

## Tests

There are none. And they would be useful. 
 
## Administration pages

We should remove these (and delete all the related code) to make things simpler 
 
## pipe / proxying the github api

The `pipe` method is extrememly confusing, and it's behaviour kind of changes when you add a handler. Its lazy evaluated, so nothing happens until you add a callback. I added a call back to log some things, which led me to believe that a request was being made twice, but actually this was just an artifact of adding the logging.

The best `pipe` document is at https://nodejs.org/api/stream.html.

`pipe` is used so that we don't have to care what the github repsonse is, we just forward it on. This means we don't have to worry about compression algorithms and suchlike. But actually a compression algorithm was causing it not to work in azure anyway, so maybe its best if we just download the response ourselves and then send it to response. This will save the headaches.

There are a lot of pipe type calls, I think we could generalise some of the code that does this.

It would be good to log the proxied calls to / from github. Maybe Morgan can do this.

# Deployment 

Azure git push deployment doesn't work at the moment, the npm commands fail. They work on my computer. I could probably upload and then try running the npm commands in the azure console to debug.

Azure zip deployments fails in the same way if the npm commands are run. But you can remove these commands from the deployment script, build locally, and then zip up and upload the already build site

When windows 10 used in team talk to polys about deployment via docker
- don't bother with any deployment stuff in the meantime.

# Build

Want to make a build for it

Maybe in vsts, as it should have some good options for deploying it to azure
