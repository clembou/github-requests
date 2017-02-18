import React from 'react';
import { Grid, Button, PageHeader, Panel, ListGroup, Label } from 'react-bootstrap';
import { Route, Switch, Link, Redirect } from 'react-router-dom';
import _ from 'lodash';
import { Loading } from '../shared/Loading';
import ghClient from '../shared/githubClient';
import { getCreator } from '../shared/requestUtils';
import NewRequest from './NewRequest';
import RequestDetails from './RequestDetails';
import moment from 'moment';

const issueVisibilityText = showOpen => showOpen ? 'open' : 'closed';

class Requests extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      issues: [],
      showOpen: true
    };
    this.getIssues = this.getIssues.bind(this);
    this.findIssue = this.findIssue.bind(this);
    this.toggleShowOpen = this.toggleShowOpen.bind(this);
  }

  componentDidMount() {
    const { params } = this.props.match;
    const labels = ['user request'];
    if (params.label !== params.repo) {
      labels.push(params.label);
    }

    if (this.props.project && !_.isEmpty(this.props.project)) {
      this.getIssues({ labels: labels.join(), state: 'all' });
    }
  }

  getIssues(issueOptions) {
    this.setState({
      isLoading: true
    });
    return ghClient.gh
      .getIssues(this.props.match.params.organisation, this.props.match.params.repo)
      .listIssues(issueOptions)
      .then(response => {
        this.setState({
          issues: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err));
  }

  findIssue(issueNumber) {
    return _.find(this.state.issues, i => i.number === parseInt(issueNumber, 10));
  }

  toggleShowOpen() {
    this.setState({ showOpen: !this.state.showOpen });
  }

  render() {
    const { match: { path, params }, ...rest } = this.props;

    if (rest.project && _.isEmpty(rest.project)) {
      //url parameters did not match the list of configured projects.
      return <Redirect to="/requests" />;
    }

    const newRequestButton = params &&
      (!params.issueNumber || params.issueNumber !== 'new') &&
      <Button
        onClick={() => this.props.push(`/requests/${params.organisation}/${params.repo}/${params.label}/new`)}
        bsStyle="default"
        bsSize="large"
      >
        New Request
      </Button>;

    return (
      <Grid>
        <div>
          <PageHeader>
            <Route
              path={`/requests/:organisation/:repo/:label/:issueNumber`}
              exact
              render={({ match: { params } }) => (
                <Link to={`/requests/${params.organisation}/${params.repo}/${params.label}`}>
                  <small className="back-link-container"><i className="fa fa-chevron-circle-left" /></small>
                </Link>
              )}
            />
            <Route
              path={`/requests/:organisation/:repo/:label`}
              exact
              render={() => (
                <Link to="/requests"><small className="back-link-container"><i className="fa fa-chevron-circle-left" /></small></Link>
              )}
            />
            {this.props.project.name}
            <span className="pull-right">
              {' '}
              {newRequestButton}
              {' '}
              {rest.isAdmin &&
                <a href={`http://github.com/${params.organisation}/${params.repo}/issues`} target="_blank">
                  <i className="fa fa-github fa-lg" />
                </a>}
              {' '}
            </span>
          </PageHeader>
        </div>
        {this.state.isLoading
          ? <Loading />
          : <Switch>
              <Route
                path={`/requests/:organisation/:repo/:label/:issueNumber`}
                exact
                render={matchProps => (
                  <Switch>
                    <Route
                      path={`${path}/new`}
                      exact
                      render={childProps => (
                        <NewRequest
                          {...matchProps}
                          isAdmin={rest.isAdmin}
                          userProfile={rest.userProfile}
                          project={rest.project}
                          onIssueCreated={this.getIssues}
                        />
                      )}
                    />
                    <Route
                      render={() => (
                        <RequestDetails
                          {...matchProps}
                          isAdmin={rest.isAdmin}
                          userProfile={rest.userProfile}
                          project={rest.project}
                          issue={this.findIssue(matchProps.match.params.issueNumber)}
                        />
                      )}
                    />
                  </Switch>
                )}
              />
              <Route
                render={() => (
                  <RequestList
                    {...this.props}
                    isAdmin={rest.isAdmin}
                    userProfile={rest.userProfile}
                    project={rest.project}
                    issues={this.state.issues.filter(i => i.state === issueVisibilityText(this.state.showOpen))}
                    shown={issueVisibilityText(this.state.showOpen)}
                    hidden={issueVisibilityText(!this.state.showOpen)}
                    onVisibilityToggle={this.toggleShowOpen}
                  />
                )}
              />
            </Switch>}
      </Grid>
    );
  }
}

Requests.defaultProps = {
  project: { name: '' }
};

export default Requests;

const RequestList = props => {
  const header = (
    <span>
      {props.issues.length}
      {' '}
      {props.shown}
      {' '}
      issues
      {' '}
      <a role="button" className="text pull-right" onClick={props.onVisibilityToggle}>Show {props.hidden} issues</a>
    </span>
  );

  return (
    <Panel defaultExpanded header={header} bsStyle="default">
      {props.issues && props.issues.length > 0
        ? <ListGroup fill>
            {props.issues.map(i => (
              <Link key={i.number} to={`${props.location.pathname}/${i.number}`} className="list-group-item">
                <IssueInfo issue={i} />
              </Link>
            ))}
          </ListGroup>
        : <div className="text text-center">
            <p><i className="fa fa-check fa-4x" aria-hidden="true" /></p>
            This project does not have any issues!
          </div>}
    </Panel>
  );
};

export const IssueInfo = props => (
  <span>
    <strong>{props.issue.title}</strong>
    <small className="text-muted">
      {' '}submitted{' '}
      <i>{moment(props.issue.created_at).fromNow()}</i>
      {' '}by{' '}
      <i>{`${getCreator(props.issue).name || getCreator(props.issue).login}`}</i>
    </small>
    <span className="text pull-right">{props.issue.labels.map(l => <Tag key={l.name} label={l} />)}</span>
  </span>
);

const Tag = props => {
  const { label } = props;
  if (label.name === 'bug') return <Label bsStyle="danger">{label.name}</Label>;
  if (label.name === 'enhancement') return <Label bsStyle="success">{label.name}</Label>;

  return null;
};
