import React from 'react'
import { Grid, Row, Col, PageHeader } from 'react-bootstrap'
// import azureClient from './shared/azureClient'
// import githubClient from './shared/githubClient'

class Signout extends React.Component {
  state = {
    message: ''
  }

  render() {
    // const { from } = this.props.location.state || { from: { pathname: '/' } }

    const content = (
      <p>TODO</p>
    )

    return (
      <Grid>
        <PageHeader>Goodbye!</PageHeader>
        <Row>
          <Col md={4}>
            {content}
          </Col>
        </Row>
      </Grid>
    )
  }
}

Signout.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Signout
