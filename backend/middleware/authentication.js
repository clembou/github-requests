const passport = require('passport');
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
const config = require('../../config');

module.exports = (appOrRouter) => {
    appOrRouter.use(passport.initialize());

    passport.use(new OIDCBearerStrategy(config.azure, function(token, done) {
        // console.log(token)
        return done(null, token, null);
      }));

    return passport.authenticate('oauth-bearer', { session: false });
};