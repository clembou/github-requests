import React from 'react';
import { Grid, PageHeader } from 'react-bootstrap';

const NoMatch = props => (
  <Grid>
    <PageHeader>Whoops</PageHeader>
    <p>Sorry but this address didn’t match any pages</p>
  </Grid>
);

export default NoMatch;
