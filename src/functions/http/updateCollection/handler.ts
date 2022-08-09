import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import * as AWSXRay from "aws-xray-sdk"
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import * as createError from 'http-errors'
import cors from '@middy/http-cors'
import { APIGatewayProxyResult } from "aws-lambda";
import schema from "./schema";
import { createLogger } from "@libs/logger";
import {updateCollection} from '../../../businessLogic/collections'
import { UpdateCollectionRequest } from '../../../requests'
import { getUserId } from "../../utils";
import { parseErrorObject } from '../../../ourstoryErrors'

if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const updaetCollectionHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    //throw new createError.Forbidden(JSON.stringify({code:555, message: 'test'}))
    
    const userId = getUserId(event.headers)
    const logger = createLogger(requestId, 'handler', 'createCollectionHandler')
    logger.info(`Starts creating collection`)
    const request: UpdateCollectionRequest = event.body
    try{
        await updateCollection(request, userId, requestId)
        logger.info('Return response 201')
        return {
            statusCode: 201,
            body: ''
        }
    }catch(error){
        const e = parseErrorObject(error)
        if(e){
            throw new createError[e.code](JSON.stringify(e))
        }else{
            throw new createError[502](error.message ? error.message : '')
        }
    }
    
}

export const main = middyfy(updaetCollectionHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))