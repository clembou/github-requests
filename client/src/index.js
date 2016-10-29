import React from 'react';
import ReactDOM from 'react-dom';
import Router from 'react-router/BrowserRouter'
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';

ReactDOM.render((
  <Router>
    <App />
  </Router>
  ),
    document.getElementById('root')
);
