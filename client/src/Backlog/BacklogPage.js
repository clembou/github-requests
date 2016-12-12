import React from 'react';
import { Match } from 'react-router';
import { Grid } from 'react-bootstrap'
import OrgSelector from './OrgSelector'
import TeamSelector from './TeamSelector'
import TeamIssues from './TeamIssues'

const BacklogPage = ({pathname}) => (
  <Grid>
    <Match pattern={`${pathname}/:organisation/:teamId/:milestoneName`} component={TeamIssues} />
    <Match pattern={`${pathname}/:organisation/:teamId`} component={TeamIssues} />
    <Match pattern={`${pathname}/:organisation`} exactly component={TeamSelector} />

    <Match pattern={pathname} exactly component={OrgSelector} />
  </Grid>
)

export default BacklogPage;
