import React from 'react'
import { Panel, Label } from 'react-bootstrap'
import MarkdownBlock from '../shared/MarkdownBlock'
import { getCreator, getContent } from '../shared/requestUtils'

const Issue = props => {
  if (!props.issue)
    return null
  const githubLink = props.isAdmin && <a href={props.issue.html_url} target="_blank"><i className="fa fa-github fa-lg" /></a>

  const header = <span>{props.issue.title} by {getCreator(props.issue).name || getCreator(props.issue).login} {githubLink} <Label className="panel-title pull-right" bsStyle={props.issue.state === 'open' ? 'primary' : 'danger'}>{props.issue.state}</Label></span>
  return (
    <Panel
      header={header}
      eventKey={props.issue.id}>
      <MarkdownBlock body={getContent(props.issue)} />
    </Panel>
  )
}

export default Issue
