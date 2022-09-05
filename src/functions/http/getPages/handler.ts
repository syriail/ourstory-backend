import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { createLogger } from "@libs/logger";
import {getPagesSummary} from '../../../businessLogic/staticPages'

const getPagesHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'getPagesHandler')
    const locale = event.pathParameters.locale
    logger.info(`Will get pages for locale`, {locale})
    const pages = await getPagesSummary(locale, requestId)
    logger.info('Return pages', {pages})
    return {
        statusCode: 200,
        body: JSON.stringify({pages})
    }
}

export const main = middyfy(getPagesHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))