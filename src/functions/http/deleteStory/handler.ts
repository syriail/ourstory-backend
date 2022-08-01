import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import * as AWSXRay from "aws-xray-sdk"
import { middyfy } from '@libs/lambda';
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'
import {deleteStory} from '../../../businessLogic/stories'
import { createLogger } from "@libs/logger";

if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const deleteStoryHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const storyId = event.pathParameters.storyId
    const logger = createLogger(requestId, 'handler', 'deleteStoryHandler')
    logger.info('Start deleting story')
    try{
        await deleteStory(storyId, requestId)
        return {
            statusCode: 204,
            body:'Deleted'
        }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.mesage)
    }
}

export const main = middyfy(deleteStoryHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))