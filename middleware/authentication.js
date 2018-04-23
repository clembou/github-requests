const passport = require('passport');
const OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;
const config = require('../config');

//const authConfig = require('../config').auth;

module.exports = (appOrRouter) => {
    // OpenID Connect Bearer Token

    appOrRouter.use(passport.initialize());

    passport.use(new OIDCBearerStrategy(config.azure, function(token, done) {
        // console.log(token)
        return done(null, token, null);
      }));
      
    //   app.use(passport.session());

    // const bearerStrategyOptions = {
    //     identityMetadata: authConfig.identityMetadata,
    //     clientID: authConfig.clientId,
    //     validateIssuer: authConfig.validateIssuer,
    //     issuer: authConfig.issuer,
    //     passReqToCallback: authConfig.passReqToCallback,
    //     isB2C: authConfig.isB2C,
    //     policyName: authConfig.policyName,
    //     allowMultiAudiencesInToken: authConfig.allowMultiAudiencesInToken,
    //     audience: authConfig.audience,
    //     loggingLevel: authConfig.loggingLevel,
    // };

    // const bearerStrategy = new OIDCBearerStrategy(bearerStrategyOptions, (token, done) => {
    //     // `token` is actually the claims dictionary (payload of the JWT token)
    //     // console.log('Token: ', token);
    //     if (!token.oid) {
    //         done(new Error('oid missing from token'));
    //     } else {
    //         done(null, token);
    //     }
    // });

    // passport.use(bearerStrategy);

    return passport.authenticate('oauth-bearer', { session: false });
};