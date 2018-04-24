const path = require('path');
const express = require('express');

const { dangerousOpenRouter } = require('./dangerousOpenRouter');

dangerousOpenRouter.use(express.static(path.resolve(__dirname, '../../client', 'build')));

// This route matches everything, so must be added last
// Always return the main index.html, so react-router render the route in the client
dangerousOpenRouter.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client', 'build', 'index.html'));
});
