import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Grid } from 'react-bootstrap';
import OrgSelector from './OrgSelector';
import TeamSelector from './TeamSelector';
import TeamIssues from './TeamIssues';

const BacklogPage = ({ location: { pathname } }) => {
  return (
    <Grid>
      <Switch>
        <Route path={`/backlog/:organisation/:teamId/:milestoneName`} component={TeamIssues} />
        <Route path={`/backlog/:organisation/:teamId`} component={TeamIssues} />
        <Route path={`/backlog/:organisation`} exact component={TeamSelector} />

        <Route component={OrgSelector} />
      </Switch>
    </Grid>
  );
};

export default BacklogPage;
