import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { APIGatewayProxyResult } from "aws-lambda";
import * as AWSXRay from "aws-xray-sdk"
import { middyfy } from '@libs/lambda';
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'
import {TranslateStoryRequest} from '../../../requests'
import schema from "./schema";
import {saveStoryTranslation} from '../../../businessLogic/stories'
import { createLogger } from "@libs/logger";
import { parseErrorObject } from '../../../ourstoryErrors'

if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const translateStoryHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'updateStoryHandler')
    const request: TranslateStoryRequest = event.body

    try{
        await saveStoryTranslation(request, requestId)
        logger.info('Story has been updated')
        return {
            statusCode: 201,
            body: ''
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

export const main = middyfy(translateStoryHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))
