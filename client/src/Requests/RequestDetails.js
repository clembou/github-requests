import React from 'react'
import { Grid, Button, PageHeader } from 'react-bootstrap'
import { Link } from 'react-router'
import { Loading } from '../shared/Loading'
import ghClient from '../shared/githubClient'
import PanelIssue from './PanelIssue'

class RequestDetails extends React.Component {
  constructor() {
    super()
    this.state = {
      isLoading: true,
      request: null,
    }
    this.getIssues = this.getIssues.bind(this)
  }

  componentDidMount() {
    this.getIssues({ labels: ['request', this.props.params.tagName].join(), state: 'all' })
  }

  getIssues() {
    return ghClient.gh.getIssues(this.props.params.orgName, this.props.params.repoName)
      .getIssue(this.props.params.issueNumber)
      .then(response => {
        this.setState({
          request: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err))
  }

  render() {
    const {pathname} = this.props
    const {request} = this.state
    return (
      <Grid>
        <PageHeader>
          {`Project Name here `}
          <Link to={`${pathname}/new/request`}>{
            ({isActive, location, href, onClick, transition}) =>
              <Button onClick={onClick}>
                New Request
              </Button>
          }</Link>
        </PageHeader>
        {(this.state.isLoading) ? (
          <Loading />
        ) : (
            <PanelIssue issue={request} />
          )}
      </Grid>)
  }
}

export default RequestDetails
