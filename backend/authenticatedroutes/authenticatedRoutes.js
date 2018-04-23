'use strict';
const express = require('express');
const app = require('../../app');

// this brings in the authenticatedRouter
const authenticatedRouter = require('./authenticatedRouter')

// these all use the authenticatedRouter, the `require` it themselves to get intellisense and to reduce nesting
require('./projects.js')
require('./issues.js')
require('./issue.js')
require('./issueComments.js')

// then we use the routes in the main app. The order of this call is not important
app.use('/api', authenticatedRouter)

