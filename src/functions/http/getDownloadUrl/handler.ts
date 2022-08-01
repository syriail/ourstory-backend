import * as AWSXRay from "aws-xray-sdk"
import { middyfy } from "@libs/lambda";
import httpErrorHandler from "@middy/http-error-handler";
import cors from '@middy/http-cors'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { getDownloadUrls } from '../../../businessLogic/stories'
import { createLogger } from "@libs/logger";
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")

const getDownloadUrlHandler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> =>{
  const requestId = event.requestContext.requestId
    const path = event.queryStringParameters.path
    const logger = createLogger(requestId, 'handler', 'getDownloadUrlHandler')
    logger.info(`Get story download url: ${path}`)
    const url = await getDownloadUrls(path, requestId)
    return {
      statusCode: 200,
      body: JSON.stringify(url)
    }

}

export const main = middyfy(getDownloadUrlHandler).use(httpErrorHandler()).use(cors({
    credentials: true
}))
