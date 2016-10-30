const azure = {
  identityMetadata: process.env.IDENTITY_METADATA,
  clientID: process.env.REACT_APP_CLIENT_ID,
  validateIssuer: process.env.NODE_ENV == 'production' ? true : false
}

const github = {
  clientID: process.env.REACT_APP_GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  botToken: process.env.GITHUB_BOT_TOKEN
}

const app = {
  groupConfigPath: process.env.GROUP_CONFIG_PATH
}

function validateConfig(configObject) {
  for (let prop of Object.keys(configObject)) {
    console.log(configObject[prop])
    if (configObject[prop] === undefined)
      throw new Error(`Missing environment variable: ${prop}`)
  }
}

validateConfig(azure)
validateConfig(github)
validateConfig(app)

module.exports = {
  azure,
  github,
  app
}
