import React from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import githubClient from './shared/githubClient';
import { LoadingWithMessage } from './shared/Loading';
import qs from 'qs';

class GithubAuthorisation extends React.Component {
  state = {
    error: ''
  };

  componentDidMount() {
    if (this.props.location.search) {
      try {
        const { code, state } = qs.parse(this.props.location.search.substring(1));
        githubClient.getToken(
          code,
          state,
          (isAuthenticated, state) => {
            this.props.onAuth(isAuthenticated, state);
          },
          error => this.setState({ error })
        );
      } catch (e) {
        this.setState({
          error: 'An error occured while processing response from github. Did you grant the app permission to access your repos?'
        });
      }
    }
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    let content;
    if (this.state.error) {
      content = (
        <Col md={4}>
          {this.state.error}
        </Col>
      );
    }
    content = this.props.location.search && !this.state.error
      ? <Col md={4}>
          <LoadingWithMessage message="Github authentication in progress..." />
        </Col>
      : <Col md={4}>
          <p>
            You must log in to view the page at <code>{from.pathname}</code>
          </p>
          <Button bsSize="large" onClick={() => githubClient.authenticate(from)}>
            Sign in with github <i className="fa fa-github fa-2x" style={{ verticalAlign: 'middle' }} aria-hidden="true" />
          </Button>
        </Col>;

    return (
      <Grid>
        <Row>
          {content}
        </Row>
      </Grid>
    );
  }
}

export default GithubAuthorisation;
