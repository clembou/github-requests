import React from 'react'
import { Grid, PageHeader, FormGroup, FormControl, ControlLabel, ButtonGroup, Button, HelpBlock } from 'react-bootstrap'

import ghClient from '../shared/githubClient';
import quoteRequestBody, { getTitleFromLabel } from '../shared/requestUtils'
import MarkdownBlock from '../shared/MarkdownBlock'


class NewRequest extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      title: '',
      body: '',
      type: 'bug',
      submissionInProgress: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()
    this.createIssue()
  }

  getValidationState() {
    const length = this.state.title.length;
    if (length > 0) return 'success';
    else return 'error';
  }

  createIssue() {
    this.setState({ submissionInProgress: true })

    const labels = ['user request', this.state.type]
    if (this.props.params.label !== this.props.params.repoName)
      labels.push(this.props.params.label)

    const issueData = {
      title: this.state.title,
      body: this.props.isAdmin ? this.state.body : quoteRequestBody(this.state.body, this.props.userProfile),
      labels
    };

    const issue = ghClient.gh.getIssues(this.props.params.orgName, this.props.params.repoName)

    issue.createIssue(issueData).then(response => {
      this.context.router.transitionTo(`/requests/${this.props.params.orgName}/${this.props.params.repoName}/${this.props.params.label}`)
    }).catch(err => {
      console.log(err)
      this.setState({ submissionInProgress: false })
    })
  }

  getTitle() {
    // this should return the title from the user supplied config. 
    // For now let's approximate this by cleaning up the supplied label name since it is available on props.params
    return getTitleFromLabel(this.props.params.label)
  }

  render() {
    return (
      <Grid>
        <PageHeader>
          {this.getTitle() + ' '}
        </PageHeader>
        <form onSubmit={this.handleSubmit} disabled={this.state.submissionInProgress}>
          <FormGroup
            controlId="formBasicText"
            bsSize="large"
            validationState={this.getValidationState()}
            >
            <ControlLabel>Request title</ControlLabel>
            <FormControl
              type="text"
              value={this.state.title}
              placeholder="Enter request title"
              onChange={(e) => this.setState({ title: e.target.value })}
              required
              />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup>
            <FormControl
              type="text"
              componentClass="textarea"
              value={this.state.body}
              placeholder="Enter request description"
              onChange={(e) => this.setState({ body: e.target.value })}
              style={{ height: 200 }}
              />
            <HelpBlock>You can format your request using <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet">Markdown</a> syntax</HelpBlock>
          </FormGroup>
          <FormGroup>
            <ButtonGroup>
              <Button onClick={() => this.setState({ type: 'bug' })} active={this.state.type === 'bug'}>Bug</Button>
              <Button onClick={() => this.setState({ type: 'enhancement' })} active={this.state.type !== 'bug'}>New Feature</Button>
            </ButtonGroup>
          </FormGroup>
          <Button
            disabled={this.state.submissionInProgress}
            onClick={!this.state.submissionInProgress ? this.handleSubmit : null}>
            {this.state.submissionInProgress ? 'Submitting...' : 'Submit request'}</Button>
          <h3>Preview:</h3>
          {this.props.userProfile && <MarkdownBlock body={this.state.body} />}
        </form>
      </Grid>
    )
  }
}

NewRequest.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default NewRequest
