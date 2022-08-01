import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
import * as createError from 'http-errors'
import { getAllTags } from '../../../businessLogic/collections'
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getTagsHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const locale = event.queryStringParameters.locale
    const logger = createLogger(requestId, 'handler', 'getTagsHandler')
    logger.info(`Get tags, locale: ${locale}`)
    if(!locale){
        logger.error('Missing locale param')
        throw new createError.BadRequest(('Missing param locale'))
    }
    try{
        const tags = await getAllTags(locale)
        logger.info(`Return ${tags.length} tag`)
    return {
        statusCode: 200,
        body: JSON.stringify({tags})
    }
    }catch(error){
        logger.error(error)
        throw new createError.InternalServerError(error.message)
    }
    
}

export const main = middyfy(getTagsHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))