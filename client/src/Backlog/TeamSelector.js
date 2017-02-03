import React from 'react'
import { PageHeader, Panel, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
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
    const org = client.gh.getOrganization(this.props.match.params.organisation);
    org.getTeams()
      .then(resp => {
        this.setState({ teams: resp.data });
      });
  }

  render() {
    const {pathname} = this.props.location
    const content = this.state.teams.length > 0 ? (
      <Panel collapsible defaultExpanded header={`Teams in ${this.props.match.params.organisation}`}>
        <ListGroup fill>
          {this.state.teams.map(team => (
            <Link key={team.id} to={`${pathname}/${team.id}`} className="list-group-item">
              {team.name}
            </Link>
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
