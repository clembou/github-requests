import React from 'react'
import Match from 'react-router/Match'
import Miss from 'react-router/Miss'
import Redirect from 'react-router/Redirect'
import moment from 'moment'
import BacklogPage from './Backlog/BacklogPage'
import RequestsPage from './Requests/RequestsPage'
import AdminConsent from './AdminConsent'
import NoMatch from './NoMatch'
import AzureLogin from './AzureLogin'
import GithubLogin from './GithubLogin'
import SignOut from './SignOut'
import githubClient from './shared/githubClient'
import azureClient from './shared/azureClient'
import { MatchWhenAuthorized, MatchWhenGithubAuthorized } from './MatchWhenAuthorized'
import AppNav from './AppNav'
import { checkStatus, parseJSON, getStandardHeaders } from './shared/clientUtils';

class App extends React.Component {
  state = {
    isAuthenticated: azureClient.isAuthenticated,
    isAdmin: azureClient.isAdmin,
    isAuthenticatedOnGithub: githubClient.isAuthenticated,
    userProfile: null,
    githubUserProfile: null,
    isLoading: true,
    projects: [],
    groups: []
  }

  handleAuth = (isAuthenticated, isAdmin, state) => {
    if (isAuthenticated)
      azureClient.getUser().then(data => {
        this.setState({ userProfile: data })
      })

    this.setState({ isAuthenticated, isAdmin })
    if (isAuthenticated && isAdmin)
      githubClient.authenticate({ pathname: state })
    else {
      githubClient.setUpProxy(azureClient.idToken)
      this.context.router.transitionTo(state)
    }
  }

  handleGithubAuth = (isAuthenticatedOnGithub, state) => {
    this.setState({ isAuthenticatedOnGithub })
    if (isAuthenticatedOnGithub)
      githubClient.gh.getUser().getProfile().then(resp => {
        this.setState({ githubUserProfile: resp.data })
      });
    this.context.router.transitionTo(state)
  }

  handleSignOut = () => {
    this.setState({
      isAuthenticated: false,
      isAdmin: null,
      isAuthenticatedOnGithub: false,
      userProfile: null,
      githubUserProfile: null
    })
  }

  componentDidMount() {
    if (this.state.isAuthenticated) {
      // Azure tokens are only valid for an hour
      // The easiest for now is just to log people out when the token expires
      setTimeout(() => this.context.router.transitionTo('/signout'), azureClient.tokenValidUntil.diff(moment()))

      azureClient.getUser().then(data => {
        this.setState({ userProfile: data })
      })

      this.getProjects();
    }

    if (this.state.isAuthenticatedOnGithub) {
      githubClient.gh.getUser().getProfile().then(resp => {
        this.setState({ githubUserProfile: resp.data })
      })
    }

  }

  getProjects() {
    fetch('/api/projects', {
      headers: getStandardHeaders(azureClient.idToken)
    }).then(checkStatus)
      .then(parseJSON)
      .then(json => {
        this.setState({ groups: json.groups, projects: json.projects, isLoading: false })
      })
  }

  render() {
    return (
      <div>
        <AppNav
          isAuthenticated={this.state.isAuthenticated}
          isAdmin={this.state.isAdmin}
          userProfile={this.state.userProfile}
          githubUserProfile={this.state.githubUserProfile}
          onToggleAdmin={() => this.setState({ isAdmin: !this.state.isAdmin })} />

        <Match exactly pattern="/" render={() => <Redirect to="/requests"/>} />
        <MatchWhenGithubAuthorized pattern="/backlog" component={BacklogPage} />


        <MatchWhenAuthorized
          pattern="/requests"
          component={RequestsPage}
          isAuthenticated={this.state.isAuthenticated}
          isAdmin={this.state.isAdmin}
          userProfile={this.state.userProfile}
          projects={this.state.projects}
          groups={this.state.groups}
          />

        <MatchWhenAuthorized
          pattern="/admin-consent"
          component={AdminConsent}
          isAuthenticated={this.state.isAuthenticated}
          isAdmin={this.state.isAdmin}
          userProfile={this.state.userProfile} />

        <Match pattern="/login/github" component={GithubLogin} />
        <Match pattern="/login/azure" component={AzureLogin} />
        <Match pattern="/signout" render={(props) => <SignOut {...props} onSignOut={this.handleSignOut} />} />

        <Match exactly pattern="/callback/github" render={(props) => <GithubLogin {...props} onAuth={this.handleGithubAuth} />} />
        <Match exactly pattern="/callback/azure" render={(props) => <AzureLogin {...props} onAuth={this.handleAuth} />} />
        <Miss component={NoMatch} />
      </div>
    )
  }
}
App.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default App
