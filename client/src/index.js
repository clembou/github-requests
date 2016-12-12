// Polyfill needed by ie 11
import 'string.prototype.startswith';

import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router/BrowserRouter';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

ReactDOM.render((
  <Router>
    <App />
  </Router>
),
  document.getElementById('root')
);
