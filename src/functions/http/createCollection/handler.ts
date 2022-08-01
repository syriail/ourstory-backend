import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { APIGatewayProxyResult } from "aws-lambda";
import schema from "./schema";
import { getUserId } from '../../utils';
import { createLogger } from "@libs/logger";
import {createCollection} from '../../../businessLogic/collections'
import {CreateCollectionRequest} from '../../../requests'

const createCollectionHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const userId = getUserId(event.headers)
    const logger = createLogger(requestId, 'handler', 'createCollectionHandler')
    logger.info(`User ${userId} starts creating collection`)
    const request: CreateCollectionRequest = event.body
    const collection = await createCollection(request, userId, requestId)
    logger.info('Return the created collection')
    return {
        statusCode: 201,
        body: JSON.stringify({collection})
    }
}

export const main = middyfy(createCollectionHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))