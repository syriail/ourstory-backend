import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
import * as createError from 'http-errors'
import { getEmployee } from '../../../businessLogic/employees'
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getEmployeeHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const employeeId = event.pathParameters.employeeId
    const logger = createLogger(requestId, 'handler', 'getEmployeeHandler')
    logger.info(`Get employee: ${employeeId}`)
    try{
        const employee = await getEmployee(employeeId, requestId)
    return {
        statusCode: 200,
        body: JSON.stringify({employee})
    }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.message)
    }
    
}

export const main = middyfy(getEmployeeHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))