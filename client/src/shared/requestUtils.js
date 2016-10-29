const qs = require('qs');

export default function quoteRequestBody(body, userinfo) {
  if (!(userinfo.name && userinfo.id && (userinfo.email || userinfo.upn)))
    throw new Error(`User information must at least contain a name, an id, and either an email or upn property. The received value was ${JSON.stringify(userinfo)}`)

  return `> From **[${userinfo.name}](mailto:${userinfo.email})** ([info](/userinfo?${qs.stringify(userinfo)})):

${body}`
}

export function getCreator(issue) {
  if (issue.user.login === process.env.REACT_APP_GITHUB_BOT_LOGIN && issue.body.startsWith('> From')){
    return parseUserInfoFromIssueBody(issue.body)
  } else {
    return issue.user
  }
}

export function getContent(issue) {
  if (issue.user.login === process.env.REACT_APP_GITHUB_BOT_LOGIN && issue.body.startsWith('> From')){
    let lines = issue.body.split('\n')
    lines.splice(0,2)
    return lines.join('\n')
  }
  else {
  return issue.body
  }
}

function parseUserInfoFromIssueBody(body) {
  // TODO a regex would be more elegant here
  let encodedUserDetails = body.split('\n')[0]
  encodedUserDetails = encodedUserDetails.split('([info](/userinfo?')[1]
  encodedUserDetails = encodedUserDetails.split(')):')[0]

  return qs.parse(encodedUserDetails)
}
