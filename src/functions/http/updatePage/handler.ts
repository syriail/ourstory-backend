import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { APIGatewayProxyResult } from "aws-lambda";
import schema from "./schema";
import { createLogger } from "@libs/logger";
import {updatePageTranslation} from '../../../businessLogic/staticPages'
import {CreateStaticPage} from '../../../requests'

const updatePageHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'updatePageHandler')
    
    const page: CreateStaticPage = event.body
    logger.info(`Will update page`, {page})
    await updatePageTranslation(page, requestId)
    return {
        statusCode: 201,
        body: ''
    }
}

export const main = middyfy(updatePageHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))