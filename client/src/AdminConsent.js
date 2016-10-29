import React from 'react'
import azureClient from './shared/azureClient'
import { Grid, Row, Button, PageHeader } from 'react-bootstrap'


export default class AzureTest extends React.Component {

  state = {
    user: {},
    isAdmin: {}
  }

  componentDidMount() {
    if (this.props.location.hash) {
      azureClient.getToken(
        this.props.location.hash,
        (isAuthenticated, isAdmin, state) => this.props.onAuth(isAuthenticated, isAdmin, state)
      )
    }
    // azureClient.getUser().then((content) => this.setState({ user: content }));
    // azureClient.checkIfUserIsAdmin().then((content) => this.setState({ isAdmin: content }));
    // azureClient.getDirectoryName().then(content => this.setState({ directoryName: content }))
  }

  render() {
    return (
      <Grid>
        <Row>
          <PageHeader>Enable Admin features</PageHeader>
          <p>This application expose more features to users from a pre-configured Active Directory group. However, checking group membership
          requires a one time approval form a directory administrator. If you are an administrator you can do so by clicking here: 
          <Button onClick={() => azureClient.grantAdminPermissions(this.props.location)}>Grant admin consent</Button>
          </p>
        </Row>
      </Grid>
    )
  }
}

// <p>Access Token</p>
// <pre>{azureClient.accessToken}</pre>
// <p>ID Token</p>
// <pre>{azureClient.idToken}</pre>
// <p>User</p>
// <pre>{JSON.stringify(this.state.user, null, 4)}</pre>
// <p>Is Admin</p>
// <pre>{JSON.stringify(this.state.isAdmin, null, 4)}</pre>
