import React from 'react'
import _ from "lodash"
import { Grid, PageHeader, ListGroup, ListGroupItem, Panel } from 'react-bootstrap'
import { Match, Miss, Link } from 'react-router';
import NewRequest from './NewRequest'
import Requests from './Requests'
import RequestDetails from './RequestDetails'
import azureClient from '../shared/azureClient'
import { checkStatus, parseJSON, getStandardHeaders } from '../shared/clientUtils.js';
import { Loading } from '../shared/Loading'

const RequestsPage = ({ pathname, ...rest }) => (
  <div>
    <Match pattern={`${pathname}/:organisation/:repo/:label`} exactly render={(props) => <Requests {...props} isAdmin={rest.isAdmin} userProfile={rest.userProfile} />} />
    <Match pattern={`${pathname}/:organisation/:repo/:label/:issueNumber`} exactly render={(outerProps) => (
      <div>
        <Match pattern={`${pathname}/:organisation/:repo/:label/new`} exactly render={(props) => <NewRequest {...outerProps} isAdmin={rest.isAdmin} userProfile={rest.userProfile} />} />
        <Miss render={(props) => <RequestDetails {...outerProps} isAdmin={rest.isAdmin} userProfile={rest.userProfile} />} />
      </div>
    )} />

    <Miss render={(props) => <RequestsPageHome {...props} isAdmin={rest.isAdmin} userProfile={rest.userProfile} />} />
  </div>
)

export default RequestsPage

class RequestsPageHome extends React.Component {

  state = {
    groups: [],
    projects: [],
    isLoading: true,
  }

  componentDidMount() {
    this.getProjectGroups();
  }

  getProjectGroups() {
    fetch('/api/projects', {
      headers: getStandardHeaders(azureClient.idToken)
    }).then(checkStatus)
      .then(parseJSON)
      .then(json => {
        this.setState({ groups: json.groups, projects: json.projects, isLoading: false })
      }
      )
  }

  render() {
    return (
      <Grid>
        {(this.state.isLoading) ? (
          <Loading />
        ) : (
            <div>
              <PageHeader>Please select a project: </PageHeader>
              {this.state.groups.length > 0 && this.state.groups.map(pg => (
                <ProjectGroup
                  key={pg.name}
                  name={pg.name}
                  description={pg.description}
                  projects={this.state.projects.filter(p => _.includes(p.groups, pg.key))} />)
              )}
            </div>
          )}
      </Grid>
    )
  }
}

const ProjectGroup = (props) => (
  <Panel collapsible defaultExpanded header={props.name}>
    {props.description && props.description}
    <ListGroup fill>
      {props.projects.map(p => (
        <Link key={p.label} to={`/requests/${p.organisation}/${p.repository}/${p.label}`}>{
          ({isActive, location, href, onClick, transition}) =>
            <ListGroupItem onClick={onClick} href={href}>
              {p.name}
            </ListGroupItem>
        }</Link>
      )
      )}
    </ListGroup>
  </Panel>
)
