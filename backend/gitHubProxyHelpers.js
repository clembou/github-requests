const config = require('../config');
const url = require('url');

const GITHUB_API_ROOT = 'https://api.github.com';

const getProxyRequestOptions = url => ({
  url: GITHUB_API_ROOT + url.replace('/api', ''),
  headers: {
    Authorization: `token ${config.github.botToken}`
    //,"user-agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
    ,"accept-encoding": "identity",
  }
});

const genericErrorHandler = (error, response, body) => {
  if (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out');
    } else {
      throw error;
    }
  }
};

module.exports = {
  getProxyRequestOptions,
  genericErrorHandler
};