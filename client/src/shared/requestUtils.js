const qs = require('qs');

const quoteRequestBody = function(body, userinfo) {
  if (!(userinfo.name && userinfo.id && (userinfo.email || userinfo.upn)))
    throw new Error(
      `User information must at least contain a name, an id, and either an email or upn property. The received value was ${JSON.stringify(
        userinfo
      )}`
    );

  return `> From **[${userinfo.name}](mailto:${userinfo.email})** ([info](/userinfo?${qs.stringify(userinfo)})):

${body}`;
};

const getCreator = function(issueOrComment) {
  if (issueOrComment.user.login === process.env.REACT_APP_GITHUB_BOT_LOGIN && issueOrComment.body.startsWith('> From')) {
    return parseUserInfoFromIssueBody(issueOrComment.body);
  } else {
    return issueOrComment.user;
  }
};

const getContent = function(issueOrComment) {
  if (issueOrComment.user.login === process.env.REACT_APP_GITHUB_BOT_LOGIN && issueOrComment.body.startsWith('> From')) {
    let lines = issueOrComment.body.split('\n');
    lines.splice(0, 2);
    return lines.join('\n');
  } else {
    return issueOrComment.body;
  }
};

function parseUserInfoFromIssueBody(body) {
  // TODO a regex would be more elegant here
  let encodedUserDetails = body.split('\n')[0];
  encodedUserDetails = encodedUserDetails.split('([info](/userinfo?')[1];
  encodedUserDetails = encodedUserDetails.split(')):')[0];

  return qs.parse(encodedUserDetails);
}

module.exports = {
  getCreator,
  getContent,
  quoteRequestBody
};
