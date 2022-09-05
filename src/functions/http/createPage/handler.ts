import { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { APIGatewayProxyResult } from "aws-lambda";
import schema from "./schema";
import { createLogger } from "@libs/logger";
import {createPage} from '../../../businessLogic/staticPages'
import {CreateStaticPage} from '../../../requests'

const createPageHandler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async(event):Promise<APIGatewayProxyResult> =>{
    const requestId = event.requestContext.requestId
    const logger = createLogger(requestId, 'handler', 'createPageHandler')
    
    const page: CreateStaticPage = event.body
    logger.info(`Will create page`, {page})
    await createPage(page, requestId)
    return {
        statusCode: 201,
        body: ''
    }
}

export const main = middyfy(createPageHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))