import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import * as AWSXRay from "aws-xray-sdk"
import { middyfy } from '@libs/lambda';
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'
import {deleteMedia} from '../../../businessLogic/stories'
import { createLogger } from "@libs/logger";
import OurstoryErrorConstructor, { parseErrorObject } from '../../../ourstoryErrors'

if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const deleteMediaHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const storyId = event.pathParameters.storyId
    const path = event.queryStringParameters.path
    const logger = createLogger(requestId, 'handler', 'deleteMediaHandler')
    logger.info('Start deleting media file')
    try{
        if(!storyId || !path) throw OurstoryErrorConstructor._403('Missing storyId or path')
        await deleteMedia(storyId, path, requestId)
        return {
            statusCode: 204,
            body:'Deleted'
        }
    }catch(error){
        logger.error(error)
        const e = parseErrorObject(error)
        if(e){
            throw new createError[e.code](JSON.stringify(e))
        }else{
            throw new createError.InternalServerError(error.message ? error.message : '')
        }
    }
}

export const main = middyfy(deleteMediaHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))