import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { APIGatewayProxyResult } from "aws-lambda";
import * as AWSXRay from "aws-xray-sdk"
import { middyfy } from '@libs/lambda';
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'
import CreateStoryRequest from '../../../requests'
import schema from "./schema";
import {createStory} from '../../../businessLogic/stories'
import { createLogger } from "@libs/logger";

if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const createStoryHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
  const requestId = event.requestContext.requestId
  const logger = createLogger(requestId, 'handler', 'createStoryHandler')
  logger.info('Start creating story')
  if(!validateRequest(event)){
    logger.info('Body is not valid', {details:event.body})
    throw new createError.BadRequest
  }
    const request: CreateStoryRequest = event.body
    try{
      const createdStory = await createStory(request, requestId)
      logger.info('Story has been created', {details:createdStory.id})
    return {
        statusCode: 201,
        body: JSON.stringify({story: createdStory})
    }
    }catch(error){
      logger.error('Story has been created', error)
      throw new createError.InternalServerError(error.message)
    }
    
}
export const main = middyfy(createStoryHandler).use(httpErrorHandler()).use(cors({
  credentials: true
}))

const validateRequest=(event)=>{
  //API gateway validation does not work offline
  if(process.env.IS_OFFLINE) return !!event.body.storyTitle && !!event.body.defaultLocale && !!event.body.collectionId
  return true
}