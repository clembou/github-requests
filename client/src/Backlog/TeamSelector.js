import React from 'react'
import {PageHeader, Row} from 'react-bootstrap'
import {Link} from 'react-router'
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
        const resgroup = client.gh.getOrganization(this.props.params.orgName);
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
              <ul>
                {this.state.teams.map(t => <li key={t.id}><Link to={`${pathname}/${t.id}`}>{t.name}</Link></li>) }
              </ul>
            </Row>
        )
    }
}

export default TeamSelector
