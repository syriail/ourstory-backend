import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { createLogger } from "@libs/logger";
import {getPageContent} from '../../../businessLogic/staticPages'

const getPageContentHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'getPageContentHandler')
    const slug = event.pathParameters.slug
    const locale = event.pathParameters.locale
    logger.info(`Will get page body for slug: ${slug}, locale: ${locale}`)
    const content = await getPageContent(slug, locale, requestId)
    logger.info('Return page details')
    return {
        statusCode: 200,
        body: JSON.stringify(content)
    }
}

export const main = middyfy(getPageContentHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))