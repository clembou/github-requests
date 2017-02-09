import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import githubClient from './shared/githubClient'


export const MatchWhenGithubAuthorized = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
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

export const MatchWhenAuthorized = ({ component: Component, isAuthenticated, isAdmin, userProfile, projects, groups, ...rest }) => (
  <Route {...rest} render={props => (
    isAuthenticated ? (
      <Component {...props} 
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      userProfile={userProfile}
      projects={projects}
      groups={groups}
       />
    ) : (
        <Redirect to={{
          pathname: '/login/azure',
          state: { from: props.location }
        }} />
      )
  )} />
)
