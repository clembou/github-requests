import React from 'react';
import { Panel, Label, Badge } from 'react-bootstrap';
import MarkdownBlock from '../shared/MarkdownBlock';
import { getCreator, getContent } from '../shared/requestUtils';
import ghClient from './../shared/githubClient';
import { IssueInfo, IssueTags, CreatedBy } from '../shared/IssueHelpers';
import { includes, upperFirst } from 'lodash';

class RequestDetails extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isLoading: true,
      comments: []
    };
    this.getIssueComments = this.getIssueComments.bind(this);
  }

  getIssueComments(issueOptions) {
    this.setState({
      isLoading: true
    });
    return ghClient.gh
      .getIssues(this.props.match.params.organisation, this.props.match.params.repo)
      .listIssues(issueOptions)
      .then(response => {
        this.setState({
          issues: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err));
  }

  componentDidMount() {
    const { params } = this.props.match;
    const labels = ['user request'];
    if (params.label !== params.repo) {
      labels.push(params.label);
    }
  }

  render() {
    const { issue } = this.props;
    if (!issue) return null;

    const title = this.props.isAdmin ? <a href={issue.html_url} target="_blank">{issue.title}</a> : issue.title;
    const labelsToDisplay = issue.labels.filter(l => !includes(['user request', this.props.project.label], l.name));
    const isOpen = issue.state === 'open';

    return (
      <div>
        <h2>
          {title}
          <small> <IssueTags labels={labelsToDisplay} /></small>
          <Label className="pull-right" bsStyle={isOpen ? 'success' : 'danger'}>
            <i className={`fa fa-${isOpen ? 'exclamation-circle' : 'check-circle'}`} />{' '}{upperFirst(issue.state)}
          </Label>
        </h2>

        <hr />

        <Panel header={<CreatedBy issue={issue} />} eventKey={issue.id}>
          <MarkdownBlock body={getContent(issue)} />
        </Panel>
        <h4>Comments</h4>
        {this.state.comments.map(comment => (
          <Panel key={comment.id} header="Submitted by X" eventKey={comment.id}>
            <MarkdownBlock body={getContent(comment)} />
          </Panel>
        ))}
      </div>
    );
  }
}

const Issue = props => {
  const { issue } = props;

  return (
    <Panel header={<CreatedBy issue={issue} />} eventKey={issue.id}>
      <MarkdownBlock body={getContent(issue)} />
    </Panel>
  );
};

export default RequestDetails;
