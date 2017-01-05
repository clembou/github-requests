import _ from 'lodash';
import qs from 'qs';
import moment from 'moment'
import { checkStatus, parseJSON, getStandardHeaders } from './clientUtils.js';

class Client {
  constructor() {
    this.tenantId = process.env.REACT_APP_TENANT_ID
    this.clientId = process.env.REACT_APP_CLIENT_ID
    this.adminGroupIds = this.getAdminGroupIds(process.env.REACT_APP_ADMIN_GROUP_ID)
    this.domainHint = process.env.REACT_APP_DOMAIN_HINT
    this.redirectUrl = window.location.origin + '/callback/azure'

    const token = JSON.parse(localStorage.getItem('azureToken'));
    if (token !== null) {
      this.processToken(token)
      this.isAdmin = JSON.parse(localStorage.getItem('isAdmin'));
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
      nonce: '678910',
      domain_hint: this.domainHint,
      resource: 'https://graph.microsoft.com'
    }

    window.location.href = `https://login.microsoftonline.com/${this.tenantId}/oauth2/authorize?${qs.stringify(params)}`
  }

  grantAdminPermissions(from) {
    const state = from || { pathname: '/' }

    const params = {
      client_id: this.clientId,
      redirect_uri: window.location.origin + '/admin-consent',
      state: state.pathname || state,
      // scope: "openid https://graph.microsoft.com/user.read",
    }
    window.location.href = `https://login.microsoftonline.com/${this.tenantId}/adminconsent?${qs.stringify(params)}`
  }


  getToken(hash, cb) {
    // response contains: access_token,expires_in,id_token,scope,session_state,state,token_type
    const tokenInfo = this.extractTokenFromHash(hash)
    if (tokenInfo.error)
      return

    const tokenValidUntil = new moment().add(tokenInfo.expires_in, 'seconds')
    tokenInfo.tokenValidUntil = tokenValidUntil.toISOString();
    localStorage.setItem('azureToken', JSON.stringify(tokenInfo))

    this.processToken(tokenInfo);
    this.checkIfUserIsAdmin()
      .then(isAdmin => {
        this.isAdmin = isAdmin
        localStorage.setItem('isAdmin', JSON.stringify(this.isAdmin))
        cb(this.isAuthenticated, this.isAdmin, decodeURIComponent(tokenInfo.state))
      })
      .catch(err => {
        this.isAdmin = null
        localStorage.setItem('isAdmin', JSON.stringify(this.isAdmin))
        cb(this.isAuthenticated, this.isAdmin, decodeURIComponent(tokenInfo.state))
      })
  }



  getTokenOld(hash, cb) {
    // response contains: access_token,expires_in,id_token,scope,session_state,state,token_type
    const tokenInfo = this.extractTokenFromHash(hash)
    if (tokenInfo.error)
      return

    const tokenValidUntil = new moment().add(tokenInfo.expires_in, 'seconds')
    tokenInfo.tokenValidUntil = tokenValidUntil.toISOString();
    localStorage.setItem('azureToken', JSON.stringify(tokenInfo))

    this.processToken(tokenInfo);
    this.checkIfUserIsAdmin()
      .then(isAdmin => {
        this.isAdmin = isAdmin
        localStorage.setItem('isAdmin', JSON.stringify(this.isAdmin))
        cb(this.isAuthenticated, this.isAdmin, decodeURIComponent(tokenInfo.state))
      })
      .catch(err => {
        this.isAdmin = null
        localStorage.setItem('isAdmin', JSON.stringify(this.isAdmin))
        cb(this.isAuthenticated, this.isAdmin, decodeURIComponent(tokenInfo.state))
      })
  }

  processToken(tokenInfo) {
    this.accessToken = tokenInfo.access_token
    this.idToken = tokenInfo.id_token
    this.isAuthenticated = true
    this.defaultHeaders = getStandardHeaders(this.accessToken)
    this.tokenValidUntil = moment(tokenInfo.tokenValidUntil)
  }

  extractTokenFromHash(hash) {
    return _.chain(hash.substring(1).split('&'))
      // eslint-disable-next-line
      .map(function (item) { if (item) return item.split('='); })
      .compact()
      .fromPairs()
      .value();
  }

  signOut() {
    localStorage.removeItem('azureToken')
    localStorage.removeItem('isAdmin')
    this.accessToken = null
    this.idToken = null
    this.isAuthenticated = false
    this.isAdmin = null
    this.defaultHeaders = getStandardHeaders()
  }

  getAdminGroupIds(groupIdsString) {
    if (typeof groupIdsString !== 'string')
      return null

    return groupIdsString.split(';')
  }

  getUser() {
    return fetch('https://graph.microsoft.com/v1.0/me', {
      method: 'get',
      headers: this.defaultHeaders,
    }).then(checkStatus)
      .then(parseJSON)
      .then(json => new Promise((resolve, reject) => {
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
          resolve(this.isUserInAnAdminGroup(json.value))
        else
          reject('problem', json);
      })
      )
  }

  isUserInAnAdminGroup(groups) {
    return _(groups)
      .keyBy('id')
      .at(this.adminGroupIds)
      .compact()
      .value()
      .length > 0
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
