import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { createLogger } from "@libs/logger";
import {getPagesNames} from '../../../businessLogic/staticPages'

const getPagesNamesHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'getPagesNamesHandler')
    const locale = event.pathParameters.locale
    logger.info(`Will get pages names for locale`, {locale})
    const names = await getPagesNames(locale, requestId)
    logger.info('Return pages names', {names})
    return {
        statusCode: 200,
        body: JSON.stringify(names)
    }
}

export const main = middyfy(getPagesNamesHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))