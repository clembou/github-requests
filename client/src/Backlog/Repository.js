import React from 'react';
import Milestone from './Milestone'
import { Col } from 'react-bootstrap'

class Repository extends React.Component {
  render() {
    const { milestones, ...other } = this.props;
    return (
      <Col xs={12} md={6}>
        <h1>{this.props.repo.name}</h1>
        {milestones.map(m => <Milestone key={m.id} milestone={m} {...other} />)}
      </Col>
    );
  }
}

export default Repository;
