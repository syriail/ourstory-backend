import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
import * as createError from 'http-errors'
import { getEmployeesByRole } from '../../../businessLogic/employees'
import { EmployeeRole } from '../../../models';
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getEmployeesByRoleHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const role = EmployeeRole[event.pathParameters.role]
    if(!role) throw new createError.NotFound('No such role')
    const logger = createLogger(requestId, 'handler', 'getEmployeesByRoleHandler')
    logger.info(`Get employees whose role is: ${role}`)
    try{
        const employees = await getEmployeesByRole(role, requestId)
    return {
        statusCode: 200,
        body: JSON.stringify({employees})
    }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.message)
    }
    
}

export const main = middyfy(getEmployeesByRoleHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))