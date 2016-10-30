import React from 'react'
import azureClient from './shared/azureClient'
import { Grid, PageHeader } from 'react-bootstrap'

export default class AdminConsent extends React.Component {




  render() {

    let content;

    if (this.props.isAdmin !== null)
      content = (
        <p>This application has already been granted the permissions required to enable admin features. No further action is needed.
        </p>
      )

    if (this.props.location.query && this.props.location.query.admin_consent === 'True')
      content = (
        <p>The admin features have been successfuly activated! It may take a few minutes before they can be used.</p>
      )

    if (this.props.location.query && this.props.location.query.error)
      content = (
        <div>
          <p>An error was encountered during the admin consent flow.</p>
          <h2>Details</h2>
          <h3>Error</h3>
          <p>{this.props.location.query.error}</p>
          <h3>Error description</h3>
          <p>{this.props.location.query.error_description}</p>
        </div>
      )

    content = content || (
      <p>This application expose more features to users from a pre-configured Active Directory group. However, checking group membership
          requires a one time approval form a directory administrator. If you are an administrator, please <a href="#" onClick={() => azureClient.grantAdminPermissions(this.props.location)}>follow this link to enable those features</a>.
        </p>
    )

    return (
      <Grid>
        <PageHeader>Admin features activation</PageHeader>
        {content}
      </Grid>
    )
  }
}
