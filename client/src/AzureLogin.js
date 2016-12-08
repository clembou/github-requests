import React from 'react'
import { Grid, Row, Col, PageHeader } from 'react-bootstrap'
import azureClient from './shared/azureClient'
import { LoadingWithMessage } from './shared/Loading'
import SignInButton from './SignInButton'

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
      <Col md={6}>
        <LoadingWithMessage message="Azure authentication in progress..." />
      </Col>) : (
        <Col md={6}>
          <p>
            You must log in to view the page at <code>{from.pathname}</code>
          </p>
          <SignInButton from={from} />
        </Col>
      )

    return (
      <Grid>
        <PageHeader>Sign in</PageHeader>
        <Row>
          {content}
        </Row>
      </Grid>
    )
  }
}


export default AzureAuthorisation
