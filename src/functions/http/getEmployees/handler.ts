import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
import * as createError from 'http-errors'
import { getEmployees } from '../../../businessLogic/employees'
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getEmployeesHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'getEmployeesHandler')
    logger.info(`Get employees`)
    try{
        const employees = await getEmployees(requestId)
    return {
        statusCode: 200,
        body: JSON.stringify({employees})
    }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.message)
    }
    
}

export const main = middyfy(getEmployeesHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))