import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { APIGatewayProxyResult } from "aws-lambda";
import schema from "./schema";
import { createLogger } from "@libs/logger";
import {updateCollection} from '../../../businessLogic/collections'
import { UpdateCollectionRequest } from '../../../requests'

const updaetCollectionHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'createCollectionHandler')
    logger.info(`Starts creating collection`)
    const request: UpdateCollectionRequest = event.body
    await updateCollection(request, requestId)
    logger.info('Return response 201')
    return {
        statusCode: 201,
        body: ''
    }
}

export const main = middyfy(updaetCollectionHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))