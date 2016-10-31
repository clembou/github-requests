import React from 'react'
import classNames from 'classnames'
import { ListGroupItem } from 'react-bootstrap'

const Issue = props => (
  <ListGroupItem>
    <a href={props.issue.html_url} className={classNames({
      'text-danger': props.issue.state === 'closed',
      'text-success': props.issue.state === 'open'
    })}>{props.issue.title}</a>
  </ListGroupItem>
)

export default Issue
