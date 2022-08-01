
import { APIGatewayProxyEventHeaders } from "aws-lambda";
import { parseUserId } from "../auth/utils";

/**
 * Get a user id from an API Gateway event's headers
 * @param headers the headers of the event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(headers: APIGatewayProxyEventHeaders): string {
  //if(process.env.IS_OFFLINE) return '3'
  const authorization = headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}