'use strict';
const express = require('express');

const dangerousOpenRouter = express.Router();

// this forces clients to use the name `dangerousOpenRouter` in their code
module.exports = { dangerousOpenRouter };