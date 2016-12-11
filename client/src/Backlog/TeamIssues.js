import React, { Component } from 'react';
import _ from 'lodash';
import ghClient from '../shared/githubClient';
import { Grid, Row, Col, FormGroup, ControlLabel, FormControl, Accordion } from 'react-bootstrap';
import Repository from './Repository';


class TeamIssues extends Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      repos: [],
      issues: [],
      milestoneFilter: ''
    }
  }

  componentDidMount() {
    this.getTeamRepos();
  }

  getTeamRepos() {
    ghClient.gh.getTeam(this.props.params.teamId).listRepos()
      .then(resp => {
        this.setState({ repos: _.filter(resp.data, { permissions: { admin: true }, fork: false }) });
        this.getRepoIssues()
      });
  }

  getRepoIssues() {
    Promise.all(this.state.repos.map(repo => {
      return ghClient.gh.getIssues(this.props.params.organisation, repo.name)
        .listIssues()
    })).then(responses => {
      const issues = responses.map((r, i) => {
        let repository = this.state.repos[i].name
        if (r.data && r.data.length > 0) {
          return r.data.map(i => {
            return {
              repository,
              title: i.title,
              number: i.number,
              dateCreated: i.created_at,
              url: i.html_url,
              creator: i.user.login,
              labels: i.labels,
              milestone: i.milestone,
              body: i.body
            }
          })
        }
      })

      this.setState({
        issues: _.chain(issues).flatten().omitBy(_.isNil).toArray().value(),
        isLoading: false
      });
    })
  }

  render() {
    if (this.state.isLoading && this.state.issues.length === 0) {
      return <p>Loading...</p>
    }
    console.log(this.state.issues)
    return (
      <Grid>
        <ul>
          {this.state.issues.map((issue) => (
            <li key={issue.url} >{issue.title}</li>
          )
          )}
        </ul>
      </Grid>
    );
  }
}

export default TeamIssues;
