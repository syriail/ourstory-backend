import { decode } from 'jsonwebtoken'

import { JwtPayload, Issuer, UserGroup } from './Jwt'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export const getIssuer = (issuer: string): Issuer =>{
  if(issuer.includes('cognito')){
    return Issuer.COGNITO
  }else if(issuer.includes('auth0')){
    return Issuer.AUTH0
  }else return Issuer.UNKNOWN
}

export const getUserGroup = (payload: JwtPayload):UserGroup =>{
  const cognitoGroups = payload['cognito:groups']
  
  if(!cognitoGroups || !cognitoGroups.length){
    return UserGroup.VISITOR
  }
  //Start from the most priverlleged role
  if(cognitoGroups.includes('ADMIN')) return UserGroup.ADMIN
  if(cognitoGroups.includes('COLLECTION_MANAGER')) return UserGroup.COLLECTION_MANAGER
  if(cognitoGroups.includes('EDITOR')) return UserGroup.EDITOR
  return UserGroup.VISITOR
}

//This function authored by https://gist.github.com/chatu/7738411c7e8dcf604bc5a0aad7937299
export const certToPEM = (cert) =>{
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}