import React from 'react'
import { Panel } from 'react-bootstrap'
import MarkdownBlock from '../shared/MarkdownBlock'
import { getCreator, getContent } from '../shared/requestUtils'

const Issue = props => {
  return (
    <Panel
      header={`${props.issue.title} by ${getCreator(props.issue).name || getCreator(props.issue).login}`}
      eventKey={props.issue.id}>
      <MarkdownBlock body={getContent(props.issue)} />
    </Panel>
  )
}

export default Issue
