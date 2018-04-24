const _ = require('lodash');
const { newCommentEmailBody, newIssueEmailBody, closedIssueEmailBody, reopenedIssueEmailBody } = require( './notificationBodies');

const processIssues = (action, issue, projectName, requestLink) => {
  switch (action) {
    case 'opened':
      return {
        subject: `Re: ${issue.title}`,
        content: newIssueEmailBody(issue, requestLink)
      };
      break;
    case 'closed':
      return {
        subject: `Re: ${issue.title}`,
        content: closedIssueEmailBody(issue, requestLink)
      };
      break;
    case 'reopened':
      return {
        subject: `Re: ${issue.title}`,
        content: reopenedIssueEmailBody(issue, requestLink)
      };
      break;
    default:
      console.log(`RequestApp: unsupported action: ${action}`);
      return { }
      break;
  }
};

const processComment = (action, issue, comment, projectName, requestLink) => {
  switch (action) {
    case 'created':
      return {
        subject: `Re: ${issue.title}`,
        content: newCommentEmailBody(issue, comment, requestLink)
      };
      break;
    default:
      console.log(`RequestApp: unsupported action: ${action}`);
      return { }
      break;
  }
};

const getNotificationText = (eventType, payload, projectName, requestLink) => {
  if (eventType === 'issues') {
    return processIssues(payload.action, payload.issue, projectName, requestLink);
  } else if (eventType === 'issue_comment') {
    return processComment(payload.action, payload.issue, payload.comment, projectName, requestLink);
  } else {
    throw new Error(`invalid eventType:${eventType} only "issues" and "issue_comment" are currently supported.`);
  }
};

const getRequestUrl = (issueNumber, project, appRootUrl) => {
  return `${appRootUrl}/requests/${project.organisation}/${project.repository}/${encodeURIComponent(project.label)}/${issueNumber}`;
};

const getAppUrl = (project, appRootUrl) => {
  return `${appRootUrl}/requests/${project.organisation}/${project.repository}/${encodeURIComponent(project.label)}`;
};

const findProject = (payload, projects) => {
  const organisation = payload.organization.login;
  const repo = payload.repository.name;
  const labels = payload.issue.labels.map(issue => issue.name);
  const project = _.find(projects, p => p.organisation === organisation && p.repository === repo);
  if (!project) {
    throw new Error(`Unable to find a matching project for issue: ${payload.issue.html_url}, organisation ${organisation}, repo, ${repo}, labels ${JSON.stringify(labels)}. Available projects: ${JSON.stringify(projects)}`);
  }
  return project;
};

module.exports = {
  findProject,
  getRequestUrl,
  getNotificationText
};
