import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, PageHeader } from 'react-bootstrap';
import SignInButton from './SignInButton';

class SignOut extends React.Component {
  state = {
    message: ''
  };

  componentDidMount() {
    this.props.onSignOut();
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    const content = <SignInButton message="Your session expired and you have been signed out." from={from} />;

    return (
      <Grid>
        <PageHeader>Goodbye!</PageHeader>
        <Row>
          <Col md={6}>
            {content}
          </Col>
        </Row>
      </Grid>
    );
  }
}

SignOut.contextTypes = {
  router: PropTypes.object.isRequired
};

export default SignOut;
