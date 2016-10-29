import React from 'react'
import { Grid, Row, Col, Button } from 'react-bootstrap'
import azureClient from './shared/azureClient'
import { LoadingWithMessage } from './shared/Loading'

class AzureAuthorisation extends React.Component {
  state = {
    message: ''
  }

  componentDidMount() {
    if (this.props.location.hash) {
      azureClient.getToken(
        this.props.location.hash,
        (isAuthenticated, isAdmin, state) => this.props.onAuth(isAuthenticated, isAdmin, state)
      )
    }
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } }

    const content = (this.props.location.hash) ? (
      <Col md={4}>
        <LoadingWithMessage message="Azure authentication in progress..." />
      </Col>) : (
        <Col md={4}>
          <p>
            You must log in to view the page at <code>{from.pathname}</code>
            <br />
            <Button onClick={() => azureClient.authenticate(from)}>Log in</Button>
          </p>
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


export default AzureAuthorisation
