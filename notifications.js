const _ = require('lodash');
// const marked = require('marked');
// this file is in the front end part of the code. This We should create a place for code that is required by both the front end and the back end, to avoid me inadvertently breaking this module when working on the frontend
// const { getCreatedBy, getContent } = require( './client/src/shared/requestUtils');
const { newCommentEmailBody, newIssueEmailBody, closedIssueEmailBody } = require( './emailBodies');

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
//         (
//           `
// <p>Your request for <b>${projectName}</b>:</p>
// <p><a href="${requestLink}">${issue.title}</a></p>
// <p>has been closed. The fix will be included in the next release.</p>`
//         )
      };
      break;
    case 'reopened':
      return {
        subject: `[Request] [Reopened] [${projectName}] - ${issue.title}`,
        content: (
          `
<p>Your request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>has been reopened.<p>`
        )
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
