import React from 'react'
import { PageHeader, Panel, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import client from '../shared/githubClient';
import { Loading } from '../shared/Loading'

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

    const content = (this.state.orgs.length > 0) ? (
      <Panel collapsible defaultExpanded header="Your Organisations">
        <ListGroup fill>
          {this.state.orgs.map(org => (
            <Link
              key={org.login}
              to={`${pathname}/${org.login}`}
              className="list-group-item"
              >{org.login}
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
        <PageHeader>Please select an organisation: </PageHeader>
        {content}
      </div>
    )
  }
}

export default OrgSelector
