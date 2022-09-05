import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { createLogger } from "@libs/logger";
import {deletePage} from '../../../businessLogic/staticPages'

const deletePageHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'deletePageHandler')
    const slug = event.pathParameters.slug
    logger.info(`Will delete page`, {slug})
    await deletePage(slug, requestId)
    return {
        statusCode: 204,
        body: ''
    }
}

export const main = middyfy(deletePageHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))