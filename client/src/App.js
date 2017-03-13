import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import moment from 'moment';
import BacklogPage from './Backlog/BacklogPage';
import RequestsPage from './Requests/RequestsPage';
import AdminConsent from './AdminConsent';
import NoMatch from './NoMatch';
import AzureLogin from './AzureLogin';
import GithubLogin from './GithubLogin';
import SignOut from './SignOut';
import githubClient from './shared/githubClient';
import azureClient from './shared/azureClient';
import { AuthenticatedRoute, GithubAuthenticatedRoute } from './AuthenticatedRoutes';
import AppNav from './AppNav';
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
  };

  handleAuth = (isAuthenticated, isAdmin, state) => {
    if (isAuthenticated) {
      azureClient.getUser().then(data => {
        this.setState({ userProfile: data });
      });
      this.getProjects();
    }

    this.setState({ isAuthenticated, isAdmin });
    if (isAuthenticated && isAdmin) {
      githubClient.authenticate({ pathname: state });
    } else {
      githubClient.setUpProxy(azureClient.idToken);
      this.context.router.history.push(state);
    }
  };

  handleGithubAuth = (isAuthenticatedOnGithub, state) => {
    this.setState({ isAuthenticatedOnGithub });
    if (isAuthenticatedOnGithub) githubClient.gh.getUser().getProfile().then(resp => {
        this.setState({ githubUserProfile: resp.data });
      });
    this.context.router.history.push(state);
  };

  signOut = () => {
    azureClient.signOut();
    githubClient.signOut();
    this.setState({
      isAuthenticated: false,
      isAdmin: null,
      isAuthenticatedOnGithub: false,
      userProfile: null,
      githubUserProfile: null
    });
  };

  componentDidMount() {
    if (this.state.isAuthenticated && azureClient.tokenValidUntil.diff(moment()) < 0) {
      // An outdated token from a previous session is currently stored in local storage.
      // Delete it by calling signOut() , AuthenticatedRoute will then kick off auth again
      // and redirect to the correct page
      this.signOut();
      return;
    }

    if (this.state.isAuthenticated) {
      // Azure tokens are only valid for an hour.
      // The easiest for now is just to log people out when the token expires
      setTimeout(() => this.context.router.history.push('/signout'), azureClient.tokenValidUntil.diff(moment()));

      azureClient.getUser().then(data => {
        this.setState({ userProfile: data });
      });

      this.getProjects();
    }

    if (this.state.isAuthenticatedOnGithub) {
      githubClient.gh.getUser().getProfile().then(resp => {
        this.setState({ githubUserProfile: resp.data });
      });
    }
  }

  getProjects() {
    fetch('/api/projects', {
      headers: getStandardHeaders(azureClient.idToken)
    })
      .then(checkStatus)
      .then(parseJSON)
      .then(json => {
        this.setState({ groups: json.groups, projects: json.projects, isLoading: false });
      });
  }

  render() {
    return (
      <div>
        <AppNav
          isAuthenticated={this.state.isAuthenticated}
          isAdmin={this.state.isAdmin}
          userProfile={this.state.userProfile}
          githubUserProfile={this.state.githubUserProfile}
          onToggleAdmin={() => this.setState({ isAdmin: !this.state.isAdmin })}
        />

        <Switch>
          <Route exact path="/" render={() => <Redirect to="/requests" />} />
          <GithubAuthenticatedRoute path="/backlog" component={BacklogPage} />

          <AuthenticatedRoute
            path="/requests"
            component={RequestsPage}
            isAuthenticated={this.state.isAuthenticated}
            isAdmin={this.state.isAdmin}
            userProfile={this.state.userProfile}
            projects={this.state.projects}
            groups={this.state.groups}
          />

          <AuthenticatedRoute
            path="/admin-consent"
            component={AdminConsent}
            isAuthenticated={this.state.isAuthenticated}
            isAdmin={this.state.isAdmin}
            userProfile={this.state.userProfile}
          />

          <Route path="/login/github" component={GithubLogin} />
          <Route path="/login/azure" component={AzureLogin} />
          <Route path="/signout" render={props => <SignOut {...props} onSignOut={this.signOut} />} />

          <Route exact path="/callback/github" render={props => <GithubLogin {...props} onAuth={this.handleGithubAuth} />} />
          <Route exact path="/callback/azure" render={props => <AzureLogin {...props} onAuth={this.handleAuth} />} />
          <Route component={NoMatch} />
        </Switch>
      </div>
    );
  }
}
App.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default App;
