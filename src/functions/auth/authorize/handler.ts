import { middyfy } from "@libs/lambda";
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerHandler, APIGatewayAuthorizerResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import * as createError from 'http-errors'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../../libs/logger'
import Axios from 'axios'
import { Jwt, JwtPayload, Issuer, UserGroup } from '../../../auth/Jwt'
import { getIssuer, getUserGroup} from '../../../auth/utils'
import * as uuid from 'uuid'
import jwkToPem from 'jwk-to-pem'



//This map is used to cache the x509 certificate chain for each key,
//so we don't need to fetch JWKS every time.
const keysCertMap: Map<string, string> = new Map()

const authorizeHandler: APIGatewayAuthorizerHandler = async(event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> =>{
  const requestId = uuid.v4()
  const logger = createLogger(requestId, 'Handler', 'authorizeHandler')
    logger.info('Authorizing a user')
  try {
    const tokenPayload = await verifyToken(event.authorizationToken, requestId)
    logger.info('User was authorized', {message: tokenPayload})
    const userGroup: UserGroup = getUserGroup(tokenPayload)
    logger.info(`User has the role: ${userGroup}`)
    switch(userGroup){
      case UserGroup.ADMIN:
        return {
          principalId: tokenPayload.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: '*'
              }
            ]
          }
        }
      case UserGroup.COLLECTION_MANAGER:
        return {
          principalId: tokenPayload.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: [
                  'arn:aws:execute-api:*:*:*/*/*/collections',
                  'arn:aws:execute-api:*:*:*/*/*/collections/*',
                  'arn:aws:execute-api:*:*:*/*/*/stories',
                  'arn:aws:execute-api:*:*:*/*/*/stories/*',
                  'arn:aws:execute-api:*:*:*/*/*/story/*',
                  'arn:aws:execute-api:*:*:*/*/*/employees/role/*',
                  'arn:aws:execute-api:*:*:*/*/GET/downloadUrl',
                  'arn:aws:execute-api:*:*:*/*/GET/uploadUrl/*',
                  'arn:aws:execute-api:*:*:*/*/GET/tags',
                  'arn:aws:execute-api:*:*:*/*/media/delete/*'
                ]
              }
            ]
          }
        }
      case UserGroup.EDITOR:
        return {
          principalId: tokenPayload.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: [
                  'arn:aws:execute-api:*:*:*/*/GET/collections',
                  'arn:aws:execute-api:*:*:*/*/GET/collections/*',
                  'arn:aws:execute-api:*:*:*/*/POST/collections/translate',
                  'arn:aws:execute-api:*:*:*/*/*/stories',
                  'arn:aws:execute-api:*:*:*/*/*/stories/*',
                  'arn:aws:execute-api:*:*:*/*/*/story/*',
                  'arn:aws:execute-api:*:*:*/*/GET/downloadUrl',
                  'arn:aws:execute-api:*:*:*/*/GET/uploadUrl/*',
                  'arn:aws:execute-api:*:*:*/*/GET/tags',
                  'arn:aws:execute-api:*:*:*/*/media/delete/*'
                ]
              }
            ]
          }
        }
      default:
        return {
          principalId: tokenPayload.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: [
                  'arn:aws:execute-api:*:*:*/*/GET/tags',
                  'arn:aws:execute-api:*:*:*/*/GET/stories/*',
                  'arn:aws:execute-api:*:*:*/*/GET/downloadUrl'
                ]
              }
            ]
          }
        }
    }
    
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
    
}

const verifyToken = async(authHeader: string, requestId: string): Promise<JwtPayload> =>{
  const logger = createLogger(requestId, 'Handler', 'verifyToken')
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt
    const kid = jwt.header.kid
    if(process.env.IS_OFFLINE){
      return jwt.payload
    }else{
      if(!kid){
        logger.error('No kid found in the token header')
        logger.info(jwt)
        throw new createError.Unauthorized()
      } 
      let jwksUrl: string
      const issuer = getIssuer(jwt.payload.iss)
      switch(issuer){
        case Issuer.COGNITO:
          jwksUrl = process.env.COGNITO_JWKS_URL
          logger.info('token issure is AWS Cognito')
          break
        case Issuer.AUTH0:
          jwksUrl = process.env.AUTH0_JWKS_URL
          logger.info('token issure is Auth0')
          break
        default:
          logger.error('Could not regognize issuer in the token header')
          logger.info(jwt)
          throw new createError.Unauthorized()
      }
      logger.info('Get certificate for kid: ' + kid)
      const cert = await getCertificate(kid, jwksUrl, requestId)
      return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload
    } 
    
  }
  
  const getToken = (authHeader: string): string =>{
    if (!authHeader) throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ')
    const token = split[1]
    console.log('Token: ' + token)
    return token
  }
const getCertificate = async(kid:string, jwksUrl: string, requestId: string): Promise<string>=>{
  const logger = createLogger(requestId, 'Handler', 'getCertificate')
  logger.info('Get certificate for kid: ' + kid)
  //If the kid already exists, then return it from cache
  const cachedCert = keysCertMap.get(kid)
  if(cachedCert) {
    logger.info('Return the certificate from cache')
    return cachedCert
  }
  //Fetch JWKS
  logger.info('Fetch certificate from JWKS')
  const jwksResponse = await Axios.get(jwksUrl)
  logger.info('jwksResponse:')
  logger.info({message: jwksResponse})
  const jwks = jwksResponse.data
  const keys = jwks.keys
  logger.info('keys:')
  logger.info({message: keys})
  if(!keys || keys.length === 0) {
    logger.error('No keys found in JWKS')
    throw new createError.Unauthorized()
  }
  //Get the corresponding JWK which matches the kid in the authorization header.
  //If none found, return Unauthorized
  const singingKey = keys.find(key =>
    key.kid === kid
  )
  if(!singingKey) {
    logger.error('No signing key foud which matches the given kid')
    throw new createError.Unauthorized()
  }
  logger.info("singingKey")
  logger.info({message: singingKey})
  if((!singingKey.x5c || !singingKey.x5c.length) && !singingKey.n){
    logger.error('No certificate found for the given kid')
    throw new createError.Unauthorized()
  }
  const cert = jwkToPem(singingKey)
  //const cert = certToPEM(issuer === Issuer.COGNITO ? singingKey.n : singingKey.x5c[0])
  //Cache the certificate
  keysCertMap.set(kid, cert)
  //return the Certificate
  return cert

}






export const main = middyfy(authorizeHandler).use(httpErrorHandler())