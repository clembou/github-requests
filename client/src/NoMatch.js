import React from 'react'
import { Grid, PageHeader } from 'react-bootstrap'

const NoMatch = ({ location }) => (
  <Grid>
    <PageHeader>Whoops</PageHeader>
    <p>Sorry but <code>{location.pathname}</code> didn’t match any pages</p>
  </Grid>
)

export default NoMatch
