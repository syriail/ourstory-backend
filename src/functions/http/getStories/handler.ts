import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
import * as createError from 'http-errors'
import { getStoriesByCollection } from '../../../businessLogic/stories'
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getStoriesHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const collectionId = event.pathParameters.collectionId
    const locale = event.queryStringParameters.locale
    const pageSize = event.queryStringParameters.size || '20'
    const lastId = event.queryStringParameters.last
    const logger = createLogger(requestId, 'handler', 'getStoriesHandler')
    logger.info(`Get stories of collection: ${collectionId}`)
    try{
        const res = await getStoriesByCollection(collectionId, locale, requestId, parseInt(pageSize), lastId)
        logger.info(`Return ${res.stories.length} story`)
    return {
        statusCode: 200,
        body: JSON.stringify(res)
    }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.message)
    }
    
}

export const main = middyfy(getStoriesHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))