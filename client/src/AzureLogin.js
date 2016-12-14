import React from 'react'
import { Grid, Row, Col, PageHeader } from 'react-bootstrap'
import azureClient from './shared/azureClient'
import { LoadingWithMessage } from './shared/Loading'
import SignInButton from './SignInButton'

const AUTO_LOGIN = process.env.NODE_ENV === 'production'
//const AUTO_LOGIN = true

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

    if (!this.props.location.hash) { //} && AUTO_LOGIN) {
      // Automatically initiate authentication in production
      azureClient.authenticate(this.getFromState())
    }
  }

  getFromState() {
    console.log(this.props.location.state)
    return (this.props.location.state && this.props.location.state.from) || { pathname: '/' }
  }

  render() {
    const from = this.getFromState()

    const content = (AUTO_LOGIN || this.props.location.hash) ? (
      <Col md={6}>
        <LoadingWithMessage message="Authentication in progress..." />
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
        <Row>
          {content}
        </Row>
      </Grid>
    )
  }
}


export default AzureAuthorisation
