'use strict';
const express = require('express');
const app = require('../app/app');

// this brings in the router
const { dangerousOpenRouter } = require('./dangerousOpenRouter')

// these all use the router, they `require` it themselves to get intellisense and to reduce nesting
require('./static.js')
require('./gitHubWebhook.js')

// then we use the routes in the main app. The order of this call is not important
app.use('/', dangerousOpenRouter)

