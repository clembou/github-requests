import GitHub from 'github-api';
import azureClient from './azureClient'
import { checkStatus, parseJSON, getStandardHeaders } from './clientUtils.js';

class Client {
  constructor() {
    this.clientId = process.env.REACT_APP_GITHUB_CLIENT_ID
    this.authUrl = "https://github.com/login/oauth/authorize"
    this.tokenProxyUrl = '/api/authenticate/github'
    this.redirectUrl = window.location.origin + '/callback/github'

    this.isAuthenticated = false;

    const token = JSON.parse(localStorage.getItem('githubToken'));
    if (token !== null) {
      this.setUp(token)
    }
    else if (azureClient.idToken && !azureClient.isAdmin) {
      this.setUpProxy(azureClient.idToken)
    }
    else {
      this.gh = null;
    }
  }

  setUp(token) {
    this.gh = new GitHub({ token });
    localStorage.setItem('githubToken', JSON.stringify(token));
    this.isAuthenticated = true;
  }

  setUpProxy(proxyToken) {
    this.gh = new GitHub({ bearer: proxyToken }, window.location.origin + '/api');
    this.isAuthenticated = true;
  }

  authenticate(state) {
    const encodedState = (state && state.pathname) ? encodeURIComponent(state.pathname) : encodeURIComponent(state)
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUrl}&scope=read:org%20repo&state=${encodedState}`
  }

  getToken(temporaryCode, state, callback) {
    fetch(`${this.tokenProxyUrl}/${temporaryCode}`, { headers: getStandardHeaders(azureClient.idToken) })
      .then(checkStatus)
      .then(parseJSON)
      .then(json => {
        if (!json.error) {
          //access_token, token_type, scope
          this.setUp(json.access_token)
          callback(this.isAuthenticated, state)
        } else {
          throw new Error('Problem while attempting to retrieve token from temporary access code');
        }
      });
  }

  signOut() {
    localStorage.removeItem('githubToken')
    this.gh = null
    this.isAuthenticated = false
  }
}

export default new Client();
