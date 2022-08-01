import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import * as AWSXRay from "aws-xray-sdk"
// import * as createError from 'http-errors'
import {formatJSONResponse} from '@libs/api-gateway'
import { getUserId } from '../../utils';
import { getCollectionsByEmployee } from '../../../businessLogic/collections'
import {createLogger} from '../../../libs/logger'
if(process.env.IS_OFFLINE) AWSXRay.setContextMissingStrategy("IGNORE_ERROR")


const getCollections: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>=>{
    const requestId = event.requestContext.requestId
    const userId = getUserId(event.headers)
    const locale = event.queryStringParameters.locale
    const logger = createLogger(requestId, 'Handler', 'getCollections')
    logger.info('Get collections')
    const collections = await getCollectionsByEmployee(userId, locale, requestId)
    logger.info('Collections fetched successfully')
    return formatJSONResponse({collections})
}

export const main = middyfy(getCollections).use(httpErrorHandler()).use(cors({
    credentials: true
}))