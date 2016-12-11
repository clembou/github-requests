import React from 'react'
import { PageHeader, Row, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { Link } from 'react-router'
import client from '../shared/githubClient';

class TeamSelector extends React.Component {
  constructor() {
    super()
    this.state = {
      teams: []
    }
  }

  componentDidMount() {
    this.getTeamsInOrganisation()
  }

  getTeamsInOrganisation() {
    const resgroup = client.gh.getOrganization(this.props.params.organisation);
    resgroup.getTeams()
      .then(resp => {
        this.setState({ teams: resp.data });
      });
  }

  render() {
    const {pathname} = this.props.location
    return (
      <Row>
        <PageHeader>Please select a team: </PageHeader>
        <Panel collapsible defaultExpanded header={`Teams in ${this.props.params.organisation}`}>
          <ListGroup fill>
          {this.state.teams.map(team => (
            <Link key={team.id} to={`${pathname}/${team.id}`}>{
              ({isActive, location, href, onClick, transition}) =>
                <ListGroupItem onClick={onClick} href={href}>
                  {team.name}
                </ListGroupItem>
            }</Link>
          )
          )}
        </ListGroup>
        </Panel>
      </Row >
    )
  }
}

export default TeamSelector
