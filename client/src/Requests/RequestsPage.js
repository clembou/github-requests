import React from 'react'
import _ from "lodash"
import { Grid, PageHeader, ListGroup, ListGroupItem, Panel, Breadcrumb } from 'react-bootstrap'
import { Match, Miss, Link } from 'react-router';
import Requests from './Requests'

const findProject = (projects, params) => {
  return _.find(projects, p => p.organisation === params.organisation && p.repository === params.repo && p.label === params.label) || {}
}

const RequestsPage = ({ pathname, ...rest }) => rest.projects.length > 0 && (
  <div>
    <Match
      pattern={`${pathname}/:organisation/:repo/:label`}
      render={(props) => (
        <Requests
          key={`${pathname}/:organisation/:repo/:label`}
          {...props}
          isAdmin={rest.isAdmin}
          userProfile={rest.userProfile}
          project={findProject(rest.projects, props.params)} />
      )} />
    <Miss render={(props) => <RequestsPageHome {...props} isAdmin={rest.isAdmin} userProfile={rest.userProfile} projects={rest.projects} groups={rest.groups} />} />
  </div>
)

export default RequestsPage

const RequestsPageHome = (props) => (
  <Grid>
    <Breadcrumb>
      <Link to="/requests">{
        ({isActive, location, href, onClick, transition}) =>
          <Breadcrumb.Item href={href} onClick={onClick}>
            Home
          </Breadcrumb.Item>
      }
      </Link>
    </Breadcrumb>
    <PageHeader>Please select a project: </PageHeader>
    {props.groups.length > 0 && props.groups.map(pg => (
      <ProjectGroup
        key={pg.name}
        name={pg.name}
        description={pg.description}
        projects={props.projects.filter(p => _.includes(p.groups, pg.key))} />)
    )}
  </Grid>
)

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
