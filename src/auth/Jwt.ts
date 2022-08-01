import { JwtHeader } from 'jsonwebtoken'

/**
 * A payload of a JWT token
 */
 export interface JwtPayload {
  iss: string
  sub: string
  iat: number
  exp: number
  'cognito:groups'?:string[]
  username?: string
  email?:string
}

/**
 * Interface representing a JWT token
 */
export interface Jwt {
  header: JwtHeader
  payload: JwtPayload
}
export enum Issuer{
  COGNITO,
  AUTH0,
  UNKNOWN
}

export enum UserGroup{
  ADMIN,
  COLLECTION_MANAGER,
  EDITOR,
  VISITOR
}