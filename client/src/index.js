// Polyfill needed by ie 11
import 'string.prototype.startswith';

import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router/BrowserRouter';
import App from './App';

// use default bootstrap theme unless a custom one is provided by the user
if (!process.env.REACT_APP_BOOTSTRAP_CSS_PATH) {
  require('bootstrap/dist/css/bootstrap.css');
} else {
  require(process.env.REACT_APP_BOOTSTRAP_CSS_PATH);
}

if (!process.env.REACT_APP_APPLICATION_STYLES_PATH) {
  require('./index.css');
} else {
  require(process.env.REACT_APP_APPLICATION_STYLES_PATH);
}

import 'font-awesome/css/font-awesome.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

ReactDOM.render((
  <Router>
    <App />
  </Router>
),
  document.getElementById('root')
);
