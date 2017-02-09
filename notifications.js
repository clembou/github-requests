const _ = require('lodash');

const processIssues = (action, issue, projectName, requestLink) => {
  switch (action) {
    case 'opened':
      return {
        subject: `[Request] [Created] [${projectName}] - ${issue.title}`,
        content: `
<p>Thanks for submitting a new request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>You will be notified when it is resolved.</p>`
      }
      break;
    case 'closed':
      return {
        subject: `[Request] [Closed] [${projectName}] - ${issue.title}`,
        content: `
<p>Your request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>has been closed. The fix will be included in the next release.</p>`
      }
      break;
    case 'reopened':
      return {
        subject: `[Request] [Reopened] [${projectName}] - ${issue.title}`,
        content: `
<p>Your request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>has been reopened.<p>`
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
        subject: `[Request] [New Comment] [${projectName}] - ${issue.title}`,
        content: `
<p>A new comment has been posted on your request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>From <i>${comment.user.login}</i>:</p>
<p>${comment.body}<p>`
      }
      break;
    case 'edited':
      return {
        subject: `[Request] [Edited Comment] [${projectName}] - ${issue.title}`,
        content: `
A comment has been edited on your request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>From <i>${comment.user.login}</i>:</p>
<p>${comment.body}<p>`
      }
      break;
    case 'deleted':
      return {
        subject: `[Request] [Deleted Comment] [${projectName}] - ${issue.title}`,
        content: `
A comment has been deleted on your request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>From <i>${comment.user.login}</i>:</p>
<p>${comment.body}<p>`
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
