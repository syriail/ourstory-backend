import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { createLogger } from "@libs/logger";
import {getPageDetails} from '../../../businessLogic/staticPages'

const getPageDetailsHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'getPageDetailsHandler')
    const slug = event.pathParameters.slug
    const locale = event.pathParameters.locale
    logger.info(`Will get pages for locale`, {locale})
    const page = await getPageDetails(slug, locale, requestId)
    logger.info('Return page details', {page})
    return {
        statusCode: 200,
        body: JSON.stringify(page)
    }
}

export const main = middyfy(getPageDetailsHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))