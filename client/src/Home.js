import React from 'react'
import azureClient from './shared/azureClient'
import Redirect from 'react-router/Redirect'
import { Grid, Row, Col, Jumbotron, Button, PageHeader } from 'react-bootstrap'


const Home = (props) => {
  if (azureClient.isAuthenticated) {
    return <Redirect to='/requests' />
  }

  return (
    <Grid>
      <PageHeader>Welcome!</PageHeader>
      <Row>
        <Col md={4}>
          <Jumbotron>
            <p>You are not logged in.</p>
            <Button
              bsSize="large"
              onClick={() => azureClient.authenticate()}
              >Sign in
            </Button>
          </Jumbotron>
        </Col>
      </Row>
    </Grid>
  )
}

export default Home
