import React from 'react';
import { FormGroup, FormControl, ControlLabel, ButtonGroup, Button, HelpBlock, Panel } from 'react-bootstrap';

import ghClient from '../shared/githubClient';
import { quoteRequestBody } from '../shared/requestUtils';
import MarkdownBlock from '../shared/MarkdownBlock';

class NewRequestComment extends React.Component {
  render() {
    return (
      <div>

        {this.props.userName &&
          this.props.newComment &&
          <Panel
            header={<span><strong>Preview:</strong><small> Submitted <i>now</i> by <i>{this.props.userName}</i></small></span>}
            bsStyle={this.props.submissionInProgress ? 'warning' : 'info'}
          >
            <MarkdownBlock body={this.props.newComment} />
          </Panel>}
        <form onSubmit={this.props.onSubmit} disabled={this.props.submissionInProgress}>
          <FormGroup>
            <FormControl
              type="text"
              componentClass="textarea"
              value={this.props.newComment}
              placeholder="Enter new comment"
              onChange={this.props.onCommentUpdate}
              style={{ height: 100 }}
            />
            <HelpBlock className="pull-right">
              You can format your comment using{' '}
              <a target="_blank" href="https://guides.github.com/features/mastering-markdown/">Markdown</a>
              {' '}syntax
            </HelpBlock>
          </FormGroup>
          <Button
            disabled={this.props.submissionInProgress || !this.props.newComment}
            onClick={!this.props.submissionInProgress ? this.props.onSubmit : null}
          >
            {this.props.submissionInProgress ? 'Submitting...' : 'Submit comment'}
          </Button>
        </form>
      </div>
    );
  }
}

export default NewRequestComment;
