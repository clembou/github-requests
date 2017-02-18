const path = require('path');
const express = require('express');

module.exports = function(app) {
  // Serve static assets
  app.use(express.static(path.resolve(__dirname, 'client', 'build')));

  // Always return the main index.html, so react-router render the route in the client
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
};
