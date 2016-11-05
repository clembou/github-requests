import React from 'react'
import { Grid, Button, PageHeader } from 'react-bootstrap'
import { Link } from 'react-router'
import { Loading } from '../shared/Loading'
import ghClient from '../shared/githubClient'
import PanelIssue from './PanelIssue'
import { getTitleFromLabel } from '../shared/requestUtils'

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
      this.getIssues({ labels: ['user request', this.props.params.label].join(), state: 'all' })
  }

  getIssues() {
    return ghClient.gh.getIssues(this.props.params.organisation, this.props.params.repo)
      .getIssue(this.props.params.issueNumber)
      .then(response => {
        this.setState({
          request: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err))
  }

  getTitle() {
    // this should return the title from the user supplied config. 
    // For now let's approximate this by cleaning up the supplied label name since it is available on props.params
    return getTitleFromLabel(this.props.params.label)
  }

  render() {
    const {params} = this.props
    const {request} = this.state
    return (
      <Grid>
        <PageHeader>
          {this.getTitle() + ' '}
          <Link to={`/requests/${params.organisation}/${params.repo}/${params.label}/new`}>{
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
