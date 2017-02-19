import React from 'react';
import moment from 'moment';
import { getCreator } from '../shared/requestUtils';
import { Label } from 'react-bootstrap';

export const IssueInfo = props => (
  <span>
    <small className="text-muted">
      {' '}submitted{' '}
      <i>{moment(props.issue.created_at).fromNow()}</i>
      {' '}by{' '}
      <i>{`${getCreator(props.issue).name || getCreator(props.issue).login}`}</i>
    </small>
    <span className="text pull-right">{props.issue.labels.map(l => <Tag key={l.name} label={l} />)}</span>
  </span>
);

export const Tag = props => {
  const { label } = props;

  if (label.name === 'bug') return <Label bsStyle="danger">{label.name}</Label>;
  if (label.name === 'enhancement') return <Label bsStyle="primary">{label.name}</Label>;
  if (label.name === 'user request') return <Label bsStyle="success">{label.name}</Label>;

  return <Label style={{ backgroundColor: `#${label.color}` }}>{label.name}</Label>;
};

export const CreatedBy = props => (
  <span>
    {' '}submitted{' '}
    <i>{moment(props.issueOrComment.created_at).fromNow()}</i>
    {' '}by{' '}
    <i>{`${getCreator(props.issueOrComment).name || getCreator(props.issueOrComment).login}`}</i>
  </span>
);

export const IssueTags = props => {
  return (
    <span>
      {props.labels.map(l => <span key={l.id}><Tag label={l} />{' '}</span>)}
    </span>
  );
};
