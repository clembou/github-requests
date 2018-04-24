'use strict'
const express = require('express')

const router = express.Router()
const authentication = require('../middleware/authentication')(router)

router.use(authentication)

module.exports = router