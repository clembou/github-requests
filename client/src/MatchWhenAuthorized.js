import React from 'react'
import Redirect from 'react-router/Redirect'
import Match from 'react-router/Match'
import githubClient from './shared/githubClient'


export const MatchWhenGithubAuthorized = ({ component: Component, ...rest }) => (
  <Match {...rest} render={props => (
    githubClient.isAuthenticated ? (
      <Component {...props} />
    ) : (
        <Redirect to={{
          pathname: '/login/github',
          state: { from: props.location }
        }} />
      )
  )} />
)

export const MatchWhenAuthorized = ({ component: Component, isAuthenticated, isAdmin, userProfile, ...rest }) => (
  <Match {...rest} render={props => (
    isAuthenticated ? (
      <Component {...props} isAuthenticated={isAuthenticated} isAdmin={isAdmin} userProfile={userProfile} />
    ) : (
        <Redirect to={{
          pathname: '/login/azure',
          state: { from: props.location }
        }} />
      )
  )} />
)

export const MatchWithUserInfo = ({ component: Component, isAdmin, userProfile, ...rest }) => (
  <Match {...rest} render={props => <Component {...props} isAdmin={isAdmin} userProfile={userProfile} />} />
)
