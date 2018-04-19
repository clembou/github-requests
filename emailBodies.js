const marked = require('marked');
// this file is in the front end part of the code. This We should create a place for code that is required by both the front end and the back end, to avoid me inadvertently breaking this module when working on the frontend
const { getCreatedBy, getContent } = require( './client/src/shared/requestUtils');

const newIssueEmailBody = (issue, requestLink) => {
  return emailBody(
    `Thanks for submitting "${issue.title}"`, 
    marked(getContent(issue)), 
    requestLink);
};


const newCommentEmailBody = (issue, comment, requestLink) => {
  return emailBody(
    `Your issue "${issue.title}" has a new comment from ${getCreatedBy(comment)}`, 
    marked(getContent(comment)), 
    requestLink);
};

// This email designed to look as much like the website as possible
// Outlook is *incredibly* bad at displaying emails, hence the html is significantly different from the actual website.
// Some helpful links about making things work with outlook
// Buttons: https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design#supporttable
// Backgrounds: https://litmus.com/blog/?s=background
// A hard to read list of whats supported: https://www.campaignmonitor.com/css/color-background/background-color/
const emailBody = (heading, body, requestLink) => {
      return (`
<html>
  <head>
    <title>${heading}</title>
  </head>
  <body>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" >
      <tr>
        <td>
          <table border="0" cellspacing="0" cellpadding="0" style="min-width:400px;">
            <tr bgcolor="#6a737b" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none;">
              <td style="padding: 10px 15px;">
              ${heading}
              </td>
            </tr>
            <tr bgcolor="#ffffff" style="font-size: 16px;font-family: Arial, sans-serif;color:#666666;text-decoration: none;">
              <td style="padding: 15px;border:1px solid;border-color:#dddddd;">
                ${body}
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
`);
};

module.exports = {
  newCommentEmailBody,
  newIssueEmailBody
};