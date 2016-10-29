import React, { Component } from 'react';
import _ from 'lodash';
import ghClient from '../shared/githubClient';
import {Grid, Row, Col, FormGroup, ControlLabel, FormControl, Accordion } from 'react-bootstrap';
import Repository from './Repository';


class TeamRepos extends Component {
    constructor() {
        super()
        this.state = {
            isLoading: true,
            repos: [],
            repoMilestones: {},
            milestoneFilter: ''
        }
        this.filterMilestones = this.filterMilestones.bind(this)
    }

    filterMilestones(e) {
        this.setState({
            milestoneFilter: e.target.value
        })
    }

    componentWillMount() {
        this.getTeamRepos();
    }

    getTeamRepos() {
        ghClient.gh.getTeam(this.props.params.teamId).listRepos()
            .then(resp => {
                this.setState({ repos: _.filter(resp.data, { permissions: { admin: true }, fork: false }) });
                this.getRepoMilestones()
            });
    }

    getRepoMilestones() {
        Promise.all(this.state.repos.map(repo => {
            return ghClient.gh.getIssues(this.props.params.orgName, repo.name)
                .listMilestones()
        })).then(responses => {
            let repoMilestones = Object.create(null);
            // eslint-disable-next-line
            responses.map((r, i) => {
                if (r.data && r.data.length > 0) {
                    repoMilestones[this.state.repos[i].name] = r.data
                }
            })
            this.setState({
                repoMilestones,
                isLoading: false
            });
        })
    }

    listRepoWithFilteredMilestones() {
        return this.state.repos.filter(r => (
            this.state.repoMilestones[r.name] !== undefined && this.repoContainsMatchingMilestones(this.state.repoMilestones[r.name])
        )
        )
    }

    repoContainsMatchingMilestones(milestones) {
        return _.filter(milestones, m => m.title
            .toLowerCase()
            .indexOf(this.state.milestoneFilter.toLowerCase()) >= 0).length > 0
    }

    render() {
        if (this.state.isLoading) {
            return <p>Loading...</p>
        }
        return (
            <Grid>
              <Row>
                <Col xs={12} md={6}>
                  <form onSubmit={this.handleSubmit}>
                    <FormGroup controlId="milestoneFilter">
                      <ControlLabel>type milestone name here to filter results</ControlLabel>
                      <FormControl
                        type="text"
                        value={this.state.milestoneFilter}
                        placeholder="type milestone name"
                        onChange={this.filterMilestones}
                      />
                    </FormGroup>
                  </form>
                </Col>
              </Row>
              <Row>
                <Accordion>
                  {this.listRepoWithFilteredMilestones().map(r => (
                    <Repository
                      key={r.name}
                      repo={r}
                      milestones={this.state.repoMilestones[r.name]}
                      params={this.props.params} />
                    )
                  ) }
                </Accordion>
              </Row>
            </Grid>
        );
    }
}

export default TeamRepos;
