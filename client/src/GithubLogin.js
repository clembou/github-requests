import React from 'react'
import { Grid, Row, Col, Button, PageHeader } from 'react-bootstrap'
import githubClient from './shared/githubClient'
import { LoadingWithMessage } from './shared/Loading'

class GithubAuthorisation extends React.Component {
  state = {
    message: ''
  }

  componentDidMount() {
    if (this.props.location.query && this.props.location.query.code && this.props.location.query.state) {
      githubClient.getToken(this.props.location.query.code, this.props.location.query.state, (isAuthenticated, state) => {
        this.props.onAuth(isAuthenticated, state)
      })
    }
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } }

    const content = (this.props.location.query && this.props.location.query.code) ? (
      <Col md={4}>
        <LoadingWithMessage message="Github authentication in progress..." />
      </Col>) : (
        <Col md={4}>
          <p>
            You must log in to view the page at <code>{from.pathname}</code>
          </p>
          <Button
            bsSize="large"
            onClick={() => githubClient.authenticate(from)}
            >Sign in with github <i className="fa fa-github fa-2x" style={{ verticalAlign: 'middle' }} aria-hidden="true"></i>
          </Button>
        </Col>
      )

    return (
      <Grid>
        <Row>
          {content}
        </Row>
      </Grid>
    )
  }
}
GithubAuthorisation.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default GithubAuthorisation
