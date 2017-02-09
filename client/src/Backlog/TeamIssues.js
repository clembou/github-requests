import React, { Component } from 'react';
import _ from 'lodash';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import ghClient from '../shared/githubClient';
import { Grid, PageHeader, Label } from 'react-bootstrap';
import { Loading } from '../shared/Loading'
import moment from 'moment'

const dateFormatter = (cell, row, enumObject, index) => cell.fromNow()
const titleFormatter = (cell, row, enumObject, index) => {
  return (
    <IssueInfo title={row.title} labels={row.labels} url={row.url}/>
  )
}

const IssueInfo = (props) => (
  <span>
    <a href={props.url} target="_blank"><i className="fa fa-github fa-lg" /> {props.title}</a> {props.labels.map(l => <Tag key={l.name} label={l} />)}
  </span>
)

const Tag = props => {
  const {label} = props

  if (label.name === "bug") return <Label bsStyle="danger">{label.name}</Label>
  if (label.name === "enhancement") return <Label bsStyle="primary">{label.name}</Label>
  if (label.name === "user request") return <Label bsStyle="success">{label.name}</Label>

  return <Label style={{ backgroundColor: label.color }}>{label.name}</Label>
}

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
    ghClient.gh.getTeam(this.props.match.params.teamId).listRepos()
      .then(resp => {
        this.setState({ repos: _.filter(resp.data, { permissions: { admin: true }, fork: false }) });
        this.getRepoIssues()
      });
  }

  getRepoIssues() {
    Promise.all(this.state.repos.map(repo => {
      return ghClient.gh.getIssues(this.props.match.params.organisation, repo.name)
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
              dateCreated: moment(i.created_at),
              url: i.html_url,
              creator: i.user.login,
              labels: i.labels,
              milestone: i.milestone,
              body: i.body
            }
          })
        }
        return null
      })

      this.setState({
        issues: _.chain(issues).flatten().omitBy(_.isNil).orderBy('dateCreated', 'desc').toArray().value(),
        isLoading: false
      });
    })
  }

  render() {

    const options = {
      //page: 2,  // which page you want to show as default
      sizePerPageList: [{
        text: '25', value: 25
      }, {
        text: '50', value: 50
      }, {
        text: 'All', value: this.state.issues.length
      }], // you can change the dropdown list for size per page
      sizePerPage: 25,  // which size per page you want to locate as default
      //pageStartIndex: 0, // where to start counting the pages
      //paginationSize: 3,  // the pagination bar size.
      prePage: 'Prev', // Previous page button text
      nextPage: 'Next', // Next page button text
      firstPage: 'First', // First page button text
      lastPage: 'Last', // Last page button text
      paginationShowsTotal: true // Accept bool or function
      // hideSizePerPage: true > You can hide the dropdown for sizePerPage
    };

    const content = this.state.issues.length > 0 ? (
      <BootstrapTable data={this.state.issues} search={true} striped hover options={options} pagination>
        <TableHeaderColumn isKey hidden dataField='url' searchable={false}>Url</TableHeaderColumn>
        <TableHeaderColumn dataField='repository' dataSort={true} width='200'>Repository</TableHeaderColumn>
        <TableHeaderColumn dataField='title' dataFormat={titleFormatter} >Title</TableHeaderColumn>
        <TableHeaderColumn dataField='dateCreated' dataFormat={dateFormatter} dataSort={true} width='150'>Date Created</TableHeaderColumn>
      </BootstrapTable>
    ) : (
        <Loading />
      )

    return (
      <Grid>
        <PageHeader>Open issues  <small>across all the team repositories</small></PageHeader>
        {content}
      </Grid>
    );
  }
}

export default TeamIssues;
