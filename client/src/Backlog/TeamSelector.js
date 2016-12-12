import React from 'react'
import { PageHeader, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { Link } from 'react-router'
import client from '../shared/githubClient';
import { Loading } from '../shared/Loading'

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
    const content = this.state.teams.length > 0 ? (
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
    ) : (
        <Loading />
      )

    return (
      <div>
        <PageHeader>Please select a team: </PageHeader>
        {content}
      </div>
    )
  }
}

export default TeamSelector
