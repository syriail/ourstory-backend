import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
import * as createError from 'http-errors'
import { getStoryDetails } from '../../../businessLogic/stories'
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getStoryDetailsHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const storyId = event.pathParameters.storyId
    const locale = event.queryStringParameters.locale
    const logger = createLogger(requestId, 'handler', 'getStoryDetailsHandler')
    logger.info(`Get story details: ${storyId}`)
    try{
        const story = await getStoryDetails(storyId, locale, requestId)
    return {
        statusCode: 200,
        body: JSON.stringify(story)
    }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.message)
    }
    
}

export const main = middyfy(getStoryDetailsHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))