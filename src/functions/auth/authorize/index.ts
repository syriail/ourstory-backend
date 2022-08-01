import { handlerPath } from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    tracing: true,
    environment:{
        AUTH0_JWKS_URL: 'https://dev-n1y358ah.us.auth0.com/.well-known/jwks.json',
        COGNITO_JWKS_URL: 'https://cognito-idp.${self:provider.region}.amazonaws.com/eu-west-1_aDjbCCegM/.well-known/jwks.json'
    },
    iamRoleStatementsInherit: true
}