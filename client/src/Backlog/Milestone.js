import React from 'react'
import ghClient from '../shared/githubClient';
import { ProgressBar, Panel, ListGroup } from 'react-bootstrap'
import Issue from './Issue'

class Milestone extends React.Component {
    constructor() {
        super()
        this.state = {
            isLoading: true,
            milestoneIssues: [],
        }
        this.getMilestoneIssues = this.getMilestoneIssues.bind(this)
    }

    componentDidMount() {
        this.getMilestoneIssues()
    }

    percentageCompleted() {
        const {closed_issues, open_issues} = this.props.milestone;
        return closed_issues / (closed_issues + open_issues) * 100
    }

    getMilestoneIssues() {
        return ghClient.gh.getIssues(this.props.params.orgName, this.props.repo.name)
            .listIssues({ milestone: this.props.milestone.number, state: 'all' })
            .then(response => {
                console.log(response)
                this.setState({
                    milestoneIssues: response.data,
                    isLoading: false
                });
            })
            .catch(err => console.log(err))
    }

    render() {
        const panelHeader = <a href={this.props.milestone.html_url}>{this.props.milestone.title}</a>
        return (
            <Panel bsStyle="primary" key={this.props.milestone.number} header={panelHeader}>
              <ProgressBar now={this.percentageCompleted() }
                label={`${this.percentageCompleted().toFixed(1)}%`} />
              {(this.state.isLoading) ? (
                <i className="fa fa-spinner fa-pulse fa-3x fa-fw">
                  <span className="sr-only">Loading...</span>
                </i>
                ) :
                (<ListGroup fill>
                  {this.state.milestoneIssues.map(i => <Issue key={i.id} issue={i} />) }
                </ListGroup>
              ) }

            </Panel>
        )
    }
}

export default Milestone
