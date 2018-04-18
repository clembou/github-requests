const _ = require('lodash');
const marked = require('marked');
// this file is in the front end part of the code. This We should create a place for code that is required by both the front end and the back end, to avoid me inadvertently breaking this module when working on the frontend
const { getCreatedBy, getContent } = require( './client/src/shared/requestUtils');

const processIssues = (action, issue, projectName, requestLink) => {
  switch (action) {
    case 'opened':
      return {
        subject: `[Request] [Created] [${projectName}] - ${issue.title}`,
        content: (
          `
<p>Thanks for submitting a new request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>You will be notified when it is resolved.</p>`
        )
      };
      break;
    case 'closed':
      return {
        subject: `[Request] [Closed] [${projectName}] - ${issue.title}`,
        content: (
          `
<p>Your request for <b>${projectName}</b>:</p>
<p><a href="${requestLink}">${issue.title}</a></p>
<p>has been closed. The fix will be included in the next release.</p>`
        )
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
      throw new Error(`Invalid action: ${action}. Only "opened", "closed", "reopened" are currently supported.`);
      break;
  }
};

// This email designed to look as much like the website as possible
// Outlook is *incredibly* bad at displaying emails, hence the html is significantly different from the actual website.
// Some helpful links about making things work with outlook
// Buttons: https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design#supporttable
// Backgrounds: https://litmus.com/blog/?s=background
// A hard to read list of whats supported: https://www.campaignmonitor.com/css/color-background/background-color/
const processComment = (action, issue, comment, projectName, requestLink) => {
  switch (action) {
    case 'created':
      return {
        subject: `Re: ${issue.title}`,
        content: (
`
<html>
  <head>
    <title>${issue.title}</title>
  </head>
  <body>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" >
      <tr>
        <td>
          <table border="0" cellspacing="0" cellpadding="0" style="min-width:400px;">
            <tr bgcolor="#6a737b" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none;">
              <td style="padding: 10px 15px;">
                Your issue "${issue.title}" has a new comment from ${getCreatedBy(comment)} :
              </td>
            </tr>
            <tr bgcolor="#ffffff" style="font-size: 16px;font-family: Arial, sans-serif;color:#666666;text-decoration: none;">
              <td style="padding: 15px;border:1px solid;border-color:#dddddd;">
                ${marked(getContent(comment))}
            </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <br />
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <table border="0" cellspacing="0" cellpadding="0"">
            <tr>
              <td align="center" style="border-radius: 6px;" bgcolor="#e6e6e6">
                <a href="${requestLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: 333333; text-decoration: none; text-decoration: none;border-radius: 6px; padding: 12px 18px; border: 1px solid #adadad; display: inline-block;">Open this issue in the Web Portal</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="color: #808080">(Unfortunately the system isn't very clever, so please don't reply to this email)</p>
  </body>
</html>
`
        )
      };
      break;
    default:
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
