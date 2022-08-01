import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { APIGatewayProxyResult } from "aws-lambda";
import schema from "./schema";
import { createLogger } from "@libs/logger";
import {saveCollectionTranslation} from '../../../businessLogic/collections'
import { TranslateCollectionRequest } from '../../../requests'

const translateCollectionHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'translateCollectionHandler')
    logger.info(`Starts translate collection`)
    const request: TranslateCollectionRequest = event.body
    await saveCollectionTranslation(request, requestId)
    logger.info('Return response 201')
    return {
        statusCode: 201,
        body: ''
    }
}

export const main = middyfy(translateCollectionHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))