import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
import * as createError from 'http-errors'
import { getCollectionDetails } from '../../../businessLogic/collections'
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getCollectionDetailsHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const collectionId = event.pathParameters.collectionId
    const locale = event.queryStringParameters.locale
    const logger = createLogger(requestId, 'handler', 'getCollectionDetailsHandler')
    logger.info(`Get collections details: ${collectionId}`)
    try{
        const collection = await getCollectionDetails(collectionId, locale, requestId)
    return {
        statusCode: 200,
        body: JSON.stringify({collection})
    }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.message)
    }
    
}

export const main = middyfy(getCollectionDetailsHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))