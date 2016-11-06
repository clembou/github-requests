import _ from 'lodash';
import qs from 'qs';
import { checkStatus, parseJSON, getStandardHeaders } from './clientUtils.js';

class Client {
  constructor() {
    this.tenantId = process.env.REACT_APP_TENANT_ID
    this.clientId = process.env.REACT_APP_CLIENT_ID
    this.adminGroupId = process.env.REACT_APP_ADMIN_GROUP_ID
    this.redirectUrl = window.location.origin + '/callback/azure'

    const token = JSON.parse(sessionStorage.getItem('azureToken'));
    if (token !== null) {
      this.processToken(token)
      this.isAdmin = JSON.parse(sessionStorage.getItem('isAdmin'));
    }
    else {
      this.accessToken = null
      this.idToken = null
      this.isAuthenticated = false
      this.isAdmin = null
      this.defaultHeaders = getStandardHeaders()
    }
  }

  authenticate(from) {
    const state = from || '/'

    const params = {
      client_id: this.clientId,
      response_type: 'id_token token',
      redirect_uri: this.redirectUrl,
      state: state.pathname || state,
      scope: "openid https://graph.microsoft.com/user.read",
      response_mode: 'fragment',
      nonce: '678910'
    }

    window.location.href = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${qs.stringify(params)}`
  }

  grantAdminPermissions(from) {
    const state = from || { pathname: '/' }

    const params = {
      client_id: this.clientId,
      redirect_uri: window.location.origin + '/admin-consent',
      state: state.pathname || state,
      //scope: "openid https://graph.microsoft.com/user.read.all https://graph.microsoft.com/directory.read.all",
      //scope: "openid https://graph.microsoft.com/user.read https://graph.microsoft.com/group.read.all"
    }
    window.location.href = `https://login.microsoftonline.com/${this.tenantId}/adminconsent?${qs.stringify(params)}`
    // window.location.href = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${qs.stringify(params)}`
  }

  getToken(hash, cb) {
    // response contains: access_token,expires_in,id_token,scope,session_state,state,token_type
    const tokenInfo = this.extractTokenFromHash(hash)
    if (tokenInfo.error)
      return

    tokenInfo.requestDateTime = new Date().toISOString();
    sessionStorage.setItem('azureToken', JSON.stringify(tokenInfo))

    this.processToken(tokenInfo);
    this.checkIfUserIsAdmin()
      .then(isAdmin => {
        this.isAdmin = isAdmin
        sessionStorage.setItem('isAdmin', JSON.stringify(this.isAdmin))
        cb(this.isAuthenticated, this.isAdmin, decodeURIComponent(tokenInfo.state))
      })
      .catch(err => {
        this.isAdmin = null
        sessionStorage.setItem('isAdmin', JSON.stringify(this.isAdmin))
        cb(this.isAuthenticated, this.isAdmin, decodeURIComponent(tokenInfo.state))
      })
  }

  processToken(tokenInfo) {
    this.accessToken = tokenInfo.access_token
    this.idToken = tokenInfo.id_token
    this.isAuthenticated = true
    this.defaultHeaders = getStandardHeaders(this.accessToken)
  }

  extractTokenFromHash(hash) {
    return _.chain(hash.substring(1).split('&'))
      // eslint-disable-next-line
      .map(function (item) { if (item) return item.split('='); })
      .compact()
      .fromPairs()
      .value();
  }

  SignOut() {
    sessionStorage.removeItem('azureToken')
    sessionStorage.removeItem('isAdmin')
      this.accessToken = null
      this.idToken = null
      this.isAuthenticated = false
      this.isAdmin = null
      this.defaultHeaders = getStandardHeaders()
  }

  getUser() {
    return fetch('https://graph.microsoft.com/v1.0/me', {
      method: 'get',
      headers: this.defaultHeaders,
    }).then(checkStatus)
      .then(parseJSON)
      .then(json => new Promise((resolve, reject) => {
        // console.log(json)
        const user = {
          name: json.displayName,
          email: json.mail,
          id: json.id,
          upn: json.userPrincipalName
        }
        resolve(user)
      })
      )
  }

  checkIfUserIsAdmin() {
    return fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
      method: 'get',
      headers: this.defaultHeaders,
    }).then(checkStatus)
      .then(parseJSON)
      .then(json => new Promise((resolve, reject) => {
        if (json && json.value)
          resolve(_.filter(json.value, { id: this.adminGroupId }).length === 1)
        else
          reject('problem', json);
      })
      )
  }
  // getDirectoryName() {
  //   return fetch('https://graph.microsoft.com/v1.0/organization', {
  //     method: 'get',
  //     headers: this.defaultHeaders,
  //   }).then(checkStatus)
  //     .then(parseJSON)
  // }
}

export default new Client();
