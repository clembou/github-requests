import React from 'react'
import {PageHeader, Row } from 'react-bootstrap'
import {Link} from 'react-router'
import client from '../shared/githubClient';

class OrgSelector extends React.Component {
    constructor() {
        super()
        this.state = {
            orgs: []
        }
    }

    componentDidMount() {
        client.gh.getUser().listOrgs().then(resp => {
                this.setState({ orgs: resp.data });
            });
    }

    render() {
        const {pathname} = this.props.location
        return (
            <Row>
              <PageHeader>Please select an organisation: </PageHeader>
              <ul>
                {this.state.orgs.map(o => <li key={o.id}><Link to={`${pathname}/${o.login}`}>{o.login}</Link></li>) }
              </ul>
            </Row>
        )
    }
}

export default OrgSelector
