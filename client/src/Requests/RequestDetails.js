import React from 'react';
import { Panel, Label } from 'react-bootstrap';
import { includes, upperFirst } from 'lodash';
import MarkdownBlock from '../shared/MarkdownBlock';
import { getContent, quoteRequestBody } from '../shared/requestUtils';
import ghClient from '../shared/githubClient';
import { IssueTags, CreatedBy } from '../shared/IssueHelpers';
import { Loading } from '../shared/Loading';
import NewRequestComment from './NewRequestComment';

class RequestDetails extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isLoading: true,
      comments: [],
      newComment: '',
      commentSubmissionInProgress: false,
      errorMessage: ''
    };
    this.handleNewCommentText = this.handleNewCommentText.bind(this);
    this.handleNewCommentSubmission = this.handleNewCommentSubmission.bind(this);
  }

  getIssueComments() {
    this.setState({
      isLoading: true
    });
    return ghClient.gh
      .getIssues(this.props.match.params.organisation, this.props.match.params.repo)
      .listIssueComments(parseInt(this.props.match.params.issueNumber, 10))
      .then(response => {
        this.setState({
          comments: response.data,
          isLoading: false
        });
      })
      .catch(err => console.log(err));
  }

  submitNewComment() {
    return ghClient.gh
      .getIssues(this.props.match.params.organisation, this.props.match.params.repo)
      .createIssueComment(
        parseInt(this.props.match.params.issueNumber, 10),
        this.props.isAdmin ? this.state.newComment : quoteRequestBody(this.state.newComment, this.props.userProfile)
      );
  }

  handleNewCommentText(e) {
    this.setState({ newComment: e.target.value });
  }

  handleNewCommentSubmission() {
    this.setState({
      commentSubmissionInProgress: true
    });
    this
      .submitNewComment(this.state.newComment)
      .then(comment => {
        this.setState({
          newComment: '',
          comments: [...this.state.comments, comment.data],
          commentSubmissionInProgress: false
        });
      })
      .catch(error => {
        console.log(error);
        this.setState({
          commentSubmissionInProgress: false,
          errorMessage: 'A problem occured while attempting to post your comment. Please try again.'
        });
      });
  }

  componentDidMount() {
    if (this.props.issue.comments > 0) {
      this.getIssueComments();
    } else {
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { issue } = this.props;
    if (!issue) return null;

    const labelsToDisplay = issue.labels.filter(l => !includes(['user request', this.props.project.label], l.name));
    const isOpen = issue.state === 'open';

    return (
      <div>
        <h2>
          <LinkIfAdmin isAdmin={this.props.isAdmin} href={issue.html_url} text={issue.title} />
          <small> <IssueTags labels={labelsToDisplay} /></small>
          <Label className="pull-right" bsStyle={isOpen ? 'success' : 'danger'}>
            <i className={`fa fa-${isOpen ? 'exclamation-circle' : 'check-circle'}`} />{' '}{upperFirst(issue.state)}
          </Label>
        </h2>

        <hr />

        <Panel
          header={<LinkIfAdmin isAdmin={this.props.isAdmin} href={issue.html_url} text={<CreatedBy issueOrComment={issue} />} />}
          eventKey={issue.id}
        >
          <MarkdownBlock body={getContent(issue)} />
        </Panel>

        <hr />
        <h4>{issue.comments} Comments</h4>
        {this.state.isLoading
          ? <Loading />
          : this.state.comments.map(comment => (
              <Panel
                key={comment.id}
                header={<LinkIfAdmin isAdmin={this.props.isAdmin} href={comment.html_url} text={<CreatedBy issueOrComment={comment} />} />}
                eventKey={comment.id}
              >
                <MarkdownBlock body={getContent(comment)} />
              </Panel>
            ))}
        <NewRequestComment
          newComment={this.state.newComment}
          onCommentUpdate={this.handleNewCommentText}
          onSubmit={this.handleNewCommentSubmission}
          submissionInProgress={this.state.commentSubmissionInProgress}
          userName={this.props.userProfile.name}
        />
      </div>
    );
  }
}

const LinkIfAdmin = props => props.isAdmin ? <a href={props.href} target="_blank">{props.text}</a> : <span>{props.text}</span>;

export default RequestDetails;
