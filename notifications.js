var _ = require('lodash');

const processIssues = (action, issue, projectName, requestLink) => {
  switch (action) {
    case 'opened':
      return {
        subject: `# Request Created # ${projectName} | ${issue.title}`,
        content: `Thanks for submitting a <a href="${requestLink}">new request</a>. You will be notified when it is resolved.`
      }
      break;
    case 'closed':
      return {
        subject: `# Request Closed # ${projectName} | ${issue.title}`,
        content: `Your <a href="${requestLink}">request</a> has been closed, and the fix will be included in the next release.`
      }
      break;
    case 'reopened':
      return {
        subject: `# Request Reopened # ${projectName} | ${issue.title}`,
        content: `Your <a href="${requestLink}">request</a> has been reopened.`
      }
      break;
    default:
      throw new Error(`Invalid action: ${action}. Only "opened", "closed", "reopened" are currently supported.`)
      break;
  }
}

const processComment = (action, issue, comment, projectName, requestLink) => {
  switch (action) {
    case 'created':
      return {
        subject: `# Request Comment # ${projectName} | ${issue.title}`,
        content: `A new comment has been posted on your <a href="${requestLink}">new request</a>.

From <i>${comment.user.login}</i>:
${comment.body}`
      }
      break;
    case 'edited':
      return {
        subject: `# Request Comment # ${projectName} | ${issue.title}`,
        content: `A comment has been edited on your <a href="${requestLink}">new request</a>.

From <i>${comment.user.login}</i>:
${comment.body}`
      }
      break;
    case 'deleted':
      return {
        subject: `# Request Comment # ${projectName} | ${issue.title}`,
        content: `A comment has been deleted on your <a href="${requestLink}">new request</a>.

From <i>${comment.user.login}</i>:
${comment.body}`
      }
      break;
    default:
      throw new Error(`Invalid action: ${action}. Only "added", "edited", "deleted" are supported.`)
      break;
  }
}

const getNotificationText = (eventType, payload, projectName, requestLink) => {
  if (eventType === 'issues') {
    return processIssues(payload.action, payload.issue, projectName, requestLink);
  } else if (eventType === 'issue_comment') {
    return processComment(payload.action, payload.issue, payload.comment, projectName, requestLink);
  } else {
    throw new Error(`invalid eventType:${eventType} only "issues" and "issue_comment" are currently supported.`)
  }
}

const getRequestUrl = (issueNumber, project, appRootUrl) => {
  return `${appRootUrl}/requests/${project.organisation}/${project.repository}/${encodeURIComponent(project.label)}/${issueNumber}`
}

const findProject = (payload, projects) => {
  const organisation = payload.organization.login;
  const repo = payload.repository.name;
  const labels = payload.issue.labels.map(issue => issue.name);
  const project = _.find(projects, p => p.organisation === organisation && p.repository === repo && labels.includes(p.label))
  if (!project) {
    throw new Error(`Unable to find a matching project for issue ${payload.issue.html_url}`)
  }
  return project;
}

module.exports = {
  findProject,
  getRequestUrl,
  getNotificationText
}
