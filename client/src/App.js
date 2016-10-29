import React from 'react'
import Match from 'react-router/Match'
import Miss from 'react-router/Miss'
import Home from './Home'
import BacklogPage from './Backlog/BacklogPage'
import RequestsPage from './Requests/RequestsPage'
import AdminConsent from './AdminConsent'
import NoMatch from './NoMatch'
import AzureLogin from './AzureLogin'
import GithubLogin from './GithubLogin'
import Signout from './Signout.js'
import githubClient from './shared/githubClient'
import azureClient from './shared/azureClient'
import { MatchWhenAuthorized, MatchWhenGithubAuthorized } from './MatchWhenAuthorized'
import AppNav from './AppNav'

class App extends React.Component {
  state = {
    isAuthenticated: azureClient.isAuthenticated,
    isAdmin: azureClient.isAdmin,
    isAuthenticatedOnGithub: githubClient.isAuthenticated,
    userProfile: null,
    githubUserProfile: null
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

  componentDidMount() {
    if (this.state.isAuthenticated)
      azureClient.getUser().then(data => {
        this.setState({ userProfile: data })
      })
    if (this.state.isAuthenticatedOnGithub){
      githubClient.gh.getUser().getProfile().then(resp => {
        this.setState({ githubUserProfile: resp.data })
      });
    }

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

        <Match exactly pattern="/" component={Home} />
        <MatchWhenGithubAuthorized pattern="/backlog" component={BacklogPage} />
        <MatchWhenAuthorized
          pattern="/requests"
          component={RequestsPage}
          isAuthenticated={this.state.isAuthenticated}
          isAdmin={this.state.isAdmin}
          userProfile={this.state.userProfile} />

        <MatchWhenAuthorized
          pattern="/admin-consent"
          component={AdminConsent}
          isAuthenticated={this.state.isAuthenticated}
          isAdmin={this.state.isAdmin}
          userProfile={this.state.userProfile} />

        <Match pattern="/login/github" component={GithubLogin} />
        <Match pattern="/login/azure" component={AzureLogin} />
        <Match pattern="/signout" component={Signout} />

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
