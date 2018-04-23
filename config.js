const fs = require('fs');

const azure = {
  identityMetadata: process.env.IDENTITY_METADATA,
  clientID: process.env.REACT_APP_CLIENT_ID,
  validateIssuer: process.env.NODE_ENV == 'production' ? true : false
};

const github = {
  clientID: process.env.REACT_APP_GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  botToken: process.env.GITHUB_BOT_TOKEN,
  botLogin: process.env.REACT_APP_GITHUB_BOT_LOGIN,
  webHookSecret: process.env.GITHUB_WEBHOOK_SECRET,
};

const app = {
  groupConfigPath: process.env.GROUP_CONFIG_PATH,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  emailSender: process.env.SENDGRID_EMAIL_SENDER
};

function validateConfig(configObject) {
  for (let prop of Object.keys(configObject)) {
    if (configObject[prop] === undefined) throw new Error(`Missing environment variable: ${prop}`);
  }
}

function loadAppData() {
  return JSON.parse(fs.readFileSync(`${__dirname}/${app.groupConfigPath}`, 'utf-8'));
}

validateConfig(azure);
validateConfig(github);
validateConfig(app);

const appData = loadAppData();

module.exports = {
  azure,
  github,
  app,
  appData
};
