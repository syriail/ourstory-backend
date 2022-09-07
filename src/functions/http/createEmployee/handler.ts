import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { APIGatewayProxyResult } from "aws-lambda";
import schema from "./schema";
import { createLogger } from "@libs/logger";
import {createEmployee} from '../../../businessLogic/employees'
import {CreateEmployeeRequest} from '../../../requests'

const createEmployeeHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'createEmployeeHandler')
    const request: CreateEmployeeRequest = event.body
    const employee = await createEmployee(request, requestId)
    logger.info('Return the created employee')
    
    return {
        statusCode: 201,
        body: JSON.stringify({employee})
    }
}

export const main = middyfy(createEmployeeHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))