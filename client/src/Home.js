import React from 'react'
import azureClient from './shared/azureClient'
import Redirect from 'react-router/Redirect'
import { Grid, Row, Col, PageHeader } from 'react-bootstrap'
import SignInButton from './SignInButton'

const Home = (props) => {
  if (azureClient.isAuthenticated) {
    return <Redirect to='/requests' />
  }

  return (
    <Grid>
      <PageHeader>Welcome!</PageHeader>
      <Row>
        <Col md={6}>
          <SignInButton />
        </Col>
      </Row>
    </Grid>
  )
}

export default Home
